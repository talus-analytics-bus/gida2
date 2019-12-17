import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donuts.module.scss";
// import * as d3 from "d3/dist/d3.min";

// Chart components
import Donut from "./Donut.js";

// FC
const Donuts = ({ data, flowType, attributeType, ...props }) => {
  // If no data, return message to that effect.
  const noData = data === null;

  return (
    <div className={styles.donuts}>
      {!noData &&
        ["P", "D", "R", "O", "General IHR", "Unspecified"].map(d => (
          <Donut
            numerator={
              data.flow_types[flowType].summaries[attributeType][d] || 0
            }
            denominator={data.flow_types[flowType].focus_node_weight}
            attrFormatter={Util.getAttrFormatter(attributeType)}
            attribute={d}
          />
        ))}
      {noData && <span>No data available.</span>}
    </div>
  );
};

export default Donuts;
