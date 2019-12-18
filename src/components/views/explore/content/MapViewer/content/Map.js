import React from "react";
import styles from "./map.module.scss";
import Util from "../../../../../misc/Util.js";

// DEBUG components
import TableInstance from "../../../../../chart/table/TableInstance.js";

// FC for Map.
const Map = ({ data, flowType, entityRole, minYear, maxYear, ...props }) => {
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
  const getMapTooltipLabel = ({ val, flowType, minYear, maxYear }) => {
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
  const getUnknownValueExplanation = ({ datum, value, entityRole }) => {
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

  return (
    <div className={styles.map}>
      <TableInstance
        tableColumns={[
          {
            title: "Location",
            prop: "focus_node_id",
            type: "text",
            render: d => d,
            func: d => d.focus_node_id
          },
          {
            title: "Map metric value",
            prop: "value",
            type: "num",
            render: d => Util.formatValue(d, flowType),
            func: d =>
              d.flow_types[flowType]
                ? d.flow_types[flowType].focus_node_weight
                : undefined
          },
          {
            title: "Unknown value explanation (if applicable)",
            prop: "unknown_explanation",
            type: "text",
            render: d => Util.formatValue(d, "text"),
            func: d =>
              d.flow_types[flowType]
                ? getUnknownValueExplanation({
                    datum: d,
                    value: d.flow_types[flowType].focus_node_weight,
                    entityRole: entityRole
                  })
                : undefined
          },
          {
            title: "Map tooltip label",
            prop: "tooltip_label",
            type: "text",
            render: d =>
              getMapTooltipLabel({
                val: d,
                flowType: flowType,
                minYear: minYear,
                maxYear: maxYear
              }),
            func: d =>
              d.flow_types[flowType]
                ? d.flow_types[flowType].focus_node_weight
                : undefined
          }
        ]}
        tableData={data}
      />
    </div>
  );
};

export default Map;
