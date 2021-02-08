import React from "react";
import Util from "../misc/Util.js";
import * as d3 from "d3/dist/d3.min";
import { calculateNeedsMet, getJeeScores } from "../misc/Data.js";

// define values that indicate "unknown credit" to source or target stakeholder
const UNKNOWN_CREDIT_VALUES = ["unknown", -8888];
const isUnknownCredit = v => UNKNOWN_CREDIT_VALUES.includes(v);

export const greens = [
  // "#eaeff1",
  // "#adccbc",
  "#99c2ae",
  "#569778",
  "#3d8662",
  "#217249",
  "#045f32",
];

export const purples = [
  "#AA9BC3",
  "#9171C5",
  "#75559d",
  "#713286",
  "#6a1266",
  "#3c003a",
];

export const pvsColors = [
  "#B879BC",
  "#974299",
  "#721277",
  "#5B045B",
  "#440042",
];
export const pvsCats = [
  ["Human, Physical and Financial Resources", "#2f456b"],
  ["Technical Authority and Capacity", "#5683ba"],
  ["Interaction with the Actors Concerned", "#6aa7e2"],
  ["Market Access", "#9bd3f9"],
];

export const jeeColors = ["#ccc", "#a91726", "#f9a510", "#007c47"];

// // Old color series with shades of yellow and green.
// // Do not use in GU sites.
// export const jeeColors = [
//   "#ccc",
//   "#ac1329",
//   "#ecb97e",
//   "#d28831",
//   "#00995e",
//   "#006840"
// ];

export const blues = [
  "#def6d0",
  // "#e0eed8",
  "#d0e4c3",
  "#a3cfca",
  "#99c9c3",
  "#82b8d1",
  "#6296be",
  "#32649f",
].reverse();

/**
 * Given the support type, datum (d), flow type, and core capacities (if
 * applicable), returns the metric value that is used for the map.
 * @method getMapMetricValue
 * @param  {[type]}          supportType    [description]
 * @param  {[type]}          d              [description]
 * @param  {[type]}          flowType       [description]
 * @param  {[type]}          coreCapacities [description]
 * @return {[type]}                         [description]
 */
export const getMapMetricValue = ({
  supportType,
  d,
  flowType,
  coreCapacities,
  forTooltip = false,
  scores = {},
}) => {
  if (["funds", "inkind"].includes(supportType)) {
    // Get assistance flow values
    return d[flowType];
  } else if (supportType === "jee") {
    // Get JEE score values.
    const node = d.target ? d.target : d.origin;
    const iso3 = node.iso3;
    const jeeScores = getJeeScores({
      scores,
      iso3,
      coreCapacities,
    });
    const avgJeeScore = d3.mean(jeeScores, d => d.score);
    return avgJeeScore;
  } else if (supportType === "needs_met") {
    // Get "needs met" values
    if (forTooltip) {
      return d["disbursed_funds"];
    } else {
      return d.needs_met;
      // // Get JEE score values.
      // const node = d.target ? d.target : d.origin;
      // if (node === undefined) return -9999;
      // else {
      //   const iso3 = node.iso3;
      //   const jeeScores = getJeeScores({
      //     scores,
      //     iso3,
      //     coreCapacities,
      //   });
      //
      //   const avgJeeScore = d3.mean(jeeScores, d => d.score);
      //
      //   return calculateNeedsMet({
      //     datum: d,
      //     avgCapScores: avgJeeScore,
      //   });
      // }
    }
  }
  return -9999;
};

/**
 * Given the support type and the data, returns the appropriate D3 map color
 * scale function.
 * Values structured like array of values, [1, 2, 3, ...].
 * @method getMapColorScale
 */
// TODO
export const getMapColorScale = ({
  supportType,
  data,
  dataNeedsMet,
  flowType,
  jeeScores,
  coreCapacities,
  entityRole,
}) => {
  const colorScaleMaker = ({ domain, range, type }) => {
    const removeUnknowns = true; // TODO with param
    const domainForScale = removeUnknowns
      ? domain.filter(d => d != -8888)
      : domain;
    const baseScale = d3[type || "scaleThreshold"]()
      .domain(domainForScale)
      .range(range);

    const colorScale = v => {
      if (type === "scaleLinear" && v === null)
        return baseScale(domainForScale[1]);
      const noData = v === "zzz" || v === -9999;
      const unknownVal = v === "yyy" || v === -8888;
      if (noData) return "#cccccc";
      else if (unknownVal) return "#cccccc";
      else {
        if (supportType === "jee") {
          if (typeof v === "number") {
            v = Util.getScoreShortName(v);
          }
          return baseScale(v);
        } else return baseScale(v);
      }
    };

    // Define d3 variables that are needed (not real versions!)
    colorScale.type = type;
    colorScale.values =
      type === "scaleQuantile" ? baseScale.quantiles() : baseScale.domain();
    colorScale.domain = () => baseScale.domain();
    colorScale.range = () => baseScale.range();
    return colorScale;
  };

  if (supportType === "inkind") {
    return colorScaleMaker({
      domain: [5, 10, 15, 20, 25],
      // domain: [5, 10, 15, 20, 25, 30],
      range: entityRole === "funder" ? greens : purples,
    });
  } else if (supportType === "funds") {
    // Get values for use in calculating quantile scales.
    const values = Object.values(data)
      .map(d => {
        return d[flowType] !== undefined ? d[flowType] : null;
      })
      .filter(d => d !== null && d !== "unknown");

    return colorScaleMaker({
      domain: values,
      range: entityRole === "funder" ? greens : purples,
      type: "scaleQuantile",
    });
  } else if (supportType === "needs_met") {
    const valueData = supportType === "needs_met" ? dataNeedsMet : data;
    const values = valueData
      .map(d => {
        return d.needs_met;
      })
      .filter(d => d >= 0);

    return colorScaleMaker({
      domain: [d3.min(values), d3.max(values)],
      range: [blues[0], blues[blues.length - 1]],
      type: "scaleLinear",
    });
  } else if (supportType === "jee") {
    return colorScaleMaker({
      domain: [
        "Unspecified",
        "None",
        "Limited or Developed",
        "Demonstrated or Sustained",
      ],
      // domain: [
      //   "Unspecified",
      //   "None",
      //   "Limited",
      //   "Developed",
      //   "Demonstrated",
      //   "Sustained"
      // ],
      range: jeeColors,
      type: "scaleOrdinal",
    });
  } else
    return d3
      .scaleLinear()
      .domain([0, 1e5])
      .range(["white", "purple"]);
};

/**
 * Given various parameters, determines the map tooltip label text that should
 * be shown.
 * @method getMapTooltipLabel
 * @param  {[type]}           val      [description]
 * @param  {[type]}           flowType [description]
 * @param  {[type]}           minYear  [description]
 * @param  {[type]}           maxYear  [description]
 * @return {[type]}                    [description]
 */
export const getMapTooltipLabel = ({
  val,
  entityRole,
  flowType,
  supportType,
  minYear,
  maxYear,
}) => {
  if (val === -8888 || val === "yyy") {
    return <span className={"text-sm"}>Specific amounts not indicated</span>;
  } else {
    if (supportType === "jee") {
      if (val === -9999 || val === "zzz") {
        return <span>No JEE score data currently available</span>;
      } else return <b>{Util.getScoreName(val)}</b>;
    } else if (val === -9999 || val === "zzz" || val === undefined) return "";
    else {
      const timeString =
        minYear === maxYear ? `in ${minYear}` : `from ${minYear} to ${maxYear}`;
      const flowTypeToUse =
        supportType === "needs_met" ? "disbursed_funds" : flowType;
      return (
        <span>
          Total <b>{Util.formatLabel(flowTypeToUse)}</b> {timeString} (
          {entityRole})
        </span>
      );
    }
  }
};

/**
 * Returns an explanation for an unknown value if applicable
 * @method getUnknownValueExplanation
 * @param  {[type]}                   datum      [description]
 * @param  {[type]}                   entityRole [description]
 * @return {[type]}                              [description]
 */
export const getUnknownValueExplanation = ({ datum, value, entityRole }) => {
  if (isUnknownCredit(value)) {
    const nodeType = entityRole === "funder" ? "origin" : "target";
    return (
      <span>
        {datum[nodeType].name} included as {entityRole} for multilateral group
        projects
      </span>
    );
  } else return undefined;
};
