import React from "react";
import styles from "./map.module.scss";

// Local content components
import D3Map from "../../../../../d3map/D3Map.js";
import Legend from "../../../../../map/Legend.js";
import { getMapColorScale } from "../../../../../map/MapUtil.js";

// FC for Map.
const Map = ({
  data,
  supportType,
  flowType,
  entityRole,
  minYear,
  maxYear,
  coreCapacities,
  ...props
}) => {
  // Get map color scale to use.
  const colorScale = getMapColorScale({
    supportType: supportType,
    data: data,
    flowType: flowType
  });

  return (
    <div className={styles.map}>
      <D3Map
        data={data}
        colorScale={colorScale}
        flowType={flowType}
        entityRole={entityRole}
        minYear={minYear}
        maxYear={maxYear}
        supportType={supportType}
        coreCapacities={coreCapacities}
      />
      <Legend {...{ colorScale, supportType, flowType }} />
    </div>
  );
};

export default Map;
