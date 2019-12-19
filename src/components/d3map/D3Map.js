import React from "react";
import styles from "./d3map.module.scss";
import TableInstance from "../chart/table/TableInstance.js";
// import {
//   getMapMetricValue,
//   getMapTooltipLabel,
//   getUnknownValueExplanation
// } from "../map/MapUtil.js";
// import { getJeeScores } from "../misc/Data.js";

// FC for D3Map.
const d3Map = ({
  mapData,
  colorScale,
  flowType,
  entityRole,
  minYear,
  maxYear,
  supportType,
  coreCapacities,
  d3MapDataFields,
  ...props
}) => {
  return (
    <div className={styles.d3Map}>
      <TableInstance
        useRowDataAsIs={true}
        tableColumns={d3MapDataFields}
        tableData={mapData}
      />
    </div>
  );
};

export default d3Map;
