import React from "react";
import Util from "../misc/Util.js";
import * as d3 from "d3/dist/d3.min";
import { calculateNeedsMet, getJeeScores } from "../misc/Data.js";
import styles from "./maputil.module.scss";
const greens = [
  "#eaeff1",
  "#99c2ae",
  "#569778",
  "#3d8662",
  "#217249",
  "#045f32"
];

const purples = [
  "#bfd3e6",
  "#88aac3",
  "#757fb6",
  "#75559d",
  "#713286",
  "#6a1266",
  "#3c003a"
];

const jeeColors = ["#ac1329", "#ecb97e", "#d28831", "#00995e", "#006840"];

const blues = [
  "#e0eed8",
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
  forTooltip = false
}) => {
  if (["funds", "inkind"].includes(supportType)) {
    // Get assistance flow values
    return d.flow_types[flowType]
      ? d.flow_types[flowType].focus_node_weight
      : undefined;
  } else if (supportType === "jee") {
    // Get JEE score values.
    const jeeScores = getJeeScores({
      scores: undefined, // TODO
      iso2: undefined, // TODO
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
      return calculateNeedsMet({
        datum: d,
        avgCapScores: undefined // TODO
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
export const getMapColorScale = ({ supportType, data, flowType }) => {
  const colorScaleMaker = ({ domain, range, type }) => {
    const baseScale = d3[type || "scaleThreshold"]()
      .domain(domain)
      .range(range);

    const colorScale = v => {
      const noData = v === "zzz" || v === -9999;
      const unknownVal = v === "yyy" || v === -8888;
      if (noData) return "#cccccc";
      else if (unknownVal) return "#cccccc";
      else {
        if (supportType === "jee") {
          console.log("Util.getScoreShortName(v)");
          console.log(Util.getScoreShortName(v));
          console.log("baseScale(Util.getScoreShortName(v))");
          console.log(baseScale(Util.getScoreShortName(v)));
          console.log("v");
          console.log(v);
          return baseScale(v);
          // return baseScale(Util.getScoreShortName(v));
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
      domain: [5, 10, 15, 20, 25, 30],
      range: greens
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
      range: purples,
      type: "scaleQuantile"
    });
  } else if (supportType === "needs_met") {
    // Get values for use in calculating quantile scales.
    // TODO perform calculation with JEE scores.
    const values = data
      .map(d => {
        return calculateNeedsMet({
          datum: d,
          avgCapScores: undefined // TODO
        });
      })
      .filter(d => d !== null && d !== "unknown");

    return colorScaleMaker({
      domain: values,
      range: blues,
      type: "scaleQuantile"
    });
  } else if (supportType === "jee") {
    return colorScaleMaker({
      domain: ["None", "Limited", "Developed", "Demonstrated", "Sustained"],
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
  if (val === -9999 || val === "zzz" || val === undefined) return "";
  if (val === -8888 || val === "yyy") {
    return <span className={"text-sm"}>Specific amounts not indicated</span>;
  } else {
    if (supportType === "jee") {
      return <b>{Util.getScoreName(val)}</b>;
    } else {
      const timeString =
        minYear === maxYear ? `in ${minYear}` : `from ${minYear} to ${maxYear}`;
      return (
        <span>
          Total <b>{Util.formatLabel(flowType)}</b> {timeString} ({entityRole})
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
  if (value === "unknown") {
    const nodeType = entityRole === "funder" ? "source" : "target";
    const nodesToShow =
      datum[nodeType].length > 1 ? "multilateral group" : datum[nodeType][0];
    return (
      <span>
        {datum.focus_node_id} included as {entityRole} for {nodesToShow}{" "}
        projects
      </span>
    );
  } else return "";
};
