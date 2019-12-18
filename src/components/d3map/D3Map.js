import React from "react";
import styles from "./d3map.module.scss";
import classNames from "classnames";
import TableInstance from "../chart/table/TableInstance.js";
import Util from "../misc/Util.js";
import {
  getMapTooltipLabel,
  getUnknownValueExplanation
} from "../map/MapUtil.js";

// FC for D3Map.
const d3Map = ({
  data,
  colorScale,
  flowType,
  entityRole,
  minYear,
  maxYear,
  ...props
}) => {
  // Define hatch mark pattern.
  const defs = (
    <defs>
      <pattern
        id="pattern-stripe"
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect
          width="3.5"
          height="4"
          transform="translate(0,0)"
          fill="lightgray"
        />
      </pattern>
      <mask id="mask-stripe">
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#pattern-stripe)"
        />
      </mask>
    </defs>
  );

  return (
    <div className={styles.d3Map}>
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
          },
          {
            title: "Color",
            prop: "color",
            type: "text",
            render: d => (
              <svg width="20" height="20">
                <rect
                  style={{ fill: colorScale(d) }}
                  className={classNames(styles.square, {
                    [styles.hatch]: d === "yyy" || d === -8888
                  })}
                />
                {defs}
              </svg>
            ),
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

export default d3Map;
