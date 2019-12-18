import React from "react";
import styles from "./d3map.module.scss";
import classNames from "classnames";
import TableInstance from "../chart/table/TableInstance.js";
import Util from "../misc/Util.js";
import {
  getMapMetricValue,
  getMapTooltipLabel,
  getUnknownValueExplanation
} from "../map/MapUtil.js";
import { getJeeScores } from "../misc/Data.js";

// FC for D3Map.
const d3Map = ({
  data,
  colorScale,
  flowType,
  entityRole,
  minYear,
  maxYear,
  supportType,
  coreCapacities,
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
            // TODO special for jee and needs_met
            title: "Map metric value",
            prop: "value",
            type: "num",
            render: d => Util.formatValue(d, supportType),
            func: d =>
              getMapMetricValue({ d, supportType, flowType, coreCapacities })
          },
          {
            title: "Unknown value explanation (if applicable)",
            prop: "unknown_explanation",
            type: "text",
            render: d => Util.formatValue(d, "text"),
            func: d =>
              getUnknownValueExplanation({
                datum: d,
                value: getMapMetricValue({
                  d,
                  supportType,
                  flowType,
                  coreCapacities
                }),
                entityRole: entityRole
              })
          },
          {
            title: "Map tooltip label",
            prop: "tooltip_label",
            type: "text",
            render: d =>
              getMapTooltipLabel({
                val: d,
                supportType,
                flowType,
                minYear,
                maxYear,
                entityRole
              }),
            func: d =>
              getMapMetricValue({ d, supportType, flowType, coreCapacities })
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
              getMapMetricValue({ d, supportType, flowType, coreCapacities })
          }
        ]}
        tableData={data}
      />
    </div>
  );
};

export default d3Map;
