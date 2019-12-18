import React from "react";
import styles from "./d3map.module.scss";
import TableInstance from "../chart/table/TableInstance.js";
import Util from "../misc/Util.js";
import {
  getMapTooltipLabel,
  getUnknownValueExplanation
} from "../map/MapUtil.js";

// FC for D3Map.
const d3Map = ({ data, flowType, entityRole, minYear, maxYear, ...props }) => {
  return (
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
              maxYear: maxYear,
              entityRole: entityRole
            }),
          func: d =>
            d.flow_types[flowType]
              ? d.flow_types[flowType].focus_node_weight
              : undefined
        }
      ]}
      tableData={data}
    />
  );
};

export default d3Map;
