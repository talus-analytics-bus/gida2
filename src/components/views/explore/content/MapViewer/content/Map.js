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
      return (
        <span>
          Total <b>{Util.formatLabel(flowType)}</b> from {minYear} to {maxYear}{" "}
          ({entityRole})
        </span>
      );
    }
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
            title: "Map tooltip label",
            prop: "tooltip_label",
            type: "text",
            render: d => d,
            func: d =>
              getMapTooltipLabel({
                val: d.flow_types[flowType]
                  ? d.flow_types[flowType].focus_node_weight
                  : undefined,
                flowType: flowType,
                minYear: minYear,
                maxYear: maxYear
              })
          }
        ]}
        tableData={data}
      />
    </div>
  );
};

export default Map;
