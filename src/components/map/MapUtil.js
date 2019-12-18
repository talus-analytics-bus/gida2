import React from "react";
import Util from "../misc/Util.js";

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
