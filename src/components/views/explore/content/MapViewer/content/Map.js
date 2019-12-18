import React from "react";
import styles from "./map.module.scss";

// Local content components
import D3Map from "../../../../../d3map/D3Map.js";

// FC for Map.
const Map = ({ data, flowType, entityRole, minYear, maxYear, ...props }) => {
  return (
    <div className={styles.map}>
      <D3Map
        data={data}
        flowType={flowType}
        entityRole={entityRole}
        minYear={minYear}
        maxYear={maxYear}
      />
    </div>
  );
};

export default Map;
