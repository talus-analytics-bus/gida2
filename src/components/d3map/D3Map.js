import React from "react";
import styles from "./d3map.module.scss";
import TableInstance from "../chart/table/TableInstance.js";
import WorldMap from "./worldMap.js";

// import {
//   getMapMetricValue,
//   getMapTooltipLabel,
//   getUnknownValueExplanation
// } from "../map/MapUtil.js";
// import { getJeeScores } from "../misc/Data.js";

// FC
const D3Map = ({
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
  React.useEffect(() => {
    const worldMap = new WorldMap("." + styles.worldMap, {});
  }, []);

  const placeholderTable = (
    <TableInstance
      useRowDataAsIs={true}
      tableColumns={d3MapDataFields}
      tableData={mapData}
      sortByProp={"value_raw"}
    />
  );

  return (
    <div className={styles.d3Map}>
      {
        // placeholderTable
      }
      {<div className={styles.worldMap} />}
    </div>
  );
};

export default D3Map;
