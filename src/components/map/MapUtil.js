import React from "react";
import Util from "../misc/Util.js";
import * as d3 from "d3/dist/d3.min";

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
    return v => {
      const noData = v === "zzz" || v === -9999;
      const unknownVal = v === "yyy" || v === -8888;
      if (noData) return "#cccccc";
      else if (unknownVal) return "#cccccc";
      else return baseScale(v);
    };
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
  minYear,
  maxYear
}) => {
  if (val === -9999 || val === "zzz" || val === undefined) return "";
  if (val === -8888 || val === "yyy") {
    return <span className={"text-sm"}>Specific amounts not indicated</span>;
  } else {
    const timeString =
      minYear === maxYear ? `in ${minYear}` : `from ${minYear} to ${maxYear}`;
    return (
      <span>
        Total <b>{Util.formatLabel(flowType)}</b> {timeString} ({entityRole})
      </span>
    );
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
