import React from "react";
import Util from "../misc/Util.js";
import * as d3 from "d3/dist/d3.min";
import { calculateNeedsMet, getJeeScores } from "../misc/Data.js";
export const greens = [
  "#eaeff1",
  "#99c2ae",
  "#569778",
  "#3d8662",
  "#217249",
  "#045f32"
];

export const purples = [
  "#bfd3e6",
  "#88aac3",
  // "#757fb6",
  "#75559d",
  "#713286",
  "#6a1266",
  "#3c003a"
];

export const pvsColors = [
  "#B879BC",
  "#974299",
  "#721277",
  "#5B045B",
  "#440042"
];
export const pvsCats = [
  ["Human, Physical and Financial Resources", "#2f456b"],
  ["Technical Authority and Capacity", "#5683ba"],
  ["Interaction with the Actors Concerned", "#6aa7e2"],
  ["Market Access", "#9bd3f9"]
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
  "#32649f"
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
  scores = {}
}) => {
  if (["funds", "inkind"].includes(supportType)) {
    // Get assistance flow values
    return d.flow_types[flowType]
      ? d.flow_types[flowType].focus_node_weight
      : undefined;
  } else if (supportType === "jee") {
    // Get JEE score values.
    const nodes = d.target ? d.target : d.source;
    const iso2 = nodes[0].id.toString();
    const jeeScores = getJeeScores({
      scores: scores, // TODO
      iso2: iso2, // TODO
      coreCapacities
    });
    const avgJeeScore = d3.mean(jeeScores, d => d.score);
    return avgJeeScore;
  } else if (supportType === "needs_met") {
    // Get "needs met" values
    if (forTooltip) {
      return d.flow_types["disbursed_funds"]
        ? d.flow_types["disbursed_funds"].focus_node_weight
        : undefined;
    } else {
      // Get JEE score values.
      const nodes = d.target ? d.target : d.source;
      const iso2 = nodes[0].id.toString();
      const jeeScores = getJeeScores({
        scores: scores, // TODO
        iso2: iso2, // TODO
        coreCapacities
      });

      const avgJeeScore = d3.mean(jeeScores, d => d.score);

      return calculateNeedsMet({
        datum: d,
        avgCapScores: avgJeeScore
      });
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
  flowType,
  jeeScores,
  coreCapacities,
  entityRole
}) => {
  const colorScaleMaker = ({ domain, range, type }) => {
    const baseScale = d3[type || "scaleThreshold"]()
      .domain(domain)
      .range(range);
    // if (type === "scaleQuantile") baseScale.clamp(true);

    const colorScale = v => {
      if (type === "scaleLinear" && v === null) return baseScale(domain[1]);
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
      range: entityRole === "funder" ? greens : purples
    });
  } else if (supportType === "funds") {
    // Get values for use in calculating quantile scales.
    const values = data
      .map(d => {
        return d.flow_types[flowType]
          ? d.flow_types[flowType].focus_node_weight
          : null;
      })
      .filter(d => d !== null && d !== "unknown");

    return colorScaleMaker({
      domain: values,
      range: entityRole === "funder" ? greens : purples,
      type: "scaleQuantile"
    });
  } else if (supportType === "needs_met") {
    // Get values for use in calculating quantile scales.
    const fakeData = [];
    for (let placeId in jeeScores) {
      const match = data.find(d => d.target[0].id === parseInt(placeId));
      if (match === undefined) {
        // Get score avg.
        const scores = getJeeScores({
          scores: jeeScores,
          iso2: placeId,
          coreCapacities
        });
        const avgJeeScore = d3.mean(scores, d => d.score);
        fakeData.push({
          flow_types: {
            disbursed_funds: {
              focus_node_weight: 0
            }
          },
          target: [{ id: parseInt(placeId), name: "TBD", type: "country" }]
        });
      }
    }
    const values = data
      .concat(fakeData)
      .map(d => {
        // Get JEE score values.
        const nodes = d.target ? d.target : d.source;
        const iso2 = nodes[0].id.toString();
        const allScores = getJeeScores({
          scores: jeeScores, // TODO
          iso2: iso2, // TODO
          coreCapacities
        });

        const avgJeeScore = d3.mean(allScores, d => d.score);

        return calculateNeedsMet({
          datum: d,
          avgCapScores: avgJeeScore // TODO
        });
      })
      .filter(d => d !== null && d !== "unknown" && d >= 0);

    return colorScaleMaker({
      domain: [d3.min(values), d3.max(values)],
      // domain: values,
      range: [blues[0], blues[blues.length - 1]],
      // range: blues,
      type: "scaleLinear"
      // type: "scaleQuantile"
    });
  } else if (supportType === "jee") {
    return colorScaleMaker({
      domain: [
        "Unspecified",
        "None",
        "Limited or Developed",
        "Demonstrated or Sustained"
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
      type: "scaleOrdinal"
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
  maxYear
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
  if (value === "unknown" || value === -8888) {
    const nodeType = entityRole === "funder" ? "source" : "target";
    // const nodesToShow =
    //   datum[nodeType].length > 1
    //     ? "multilateral group"
    //     : datum[nodeType][0].name;
    return (
      <span>
        {datum[nodeType][0].name} included as {entityRole} for multilateral
        group projects
      </span>
    );
  } else return undefined;
};
