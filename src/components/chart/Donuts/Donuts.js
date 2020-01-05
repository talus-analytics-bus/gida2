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

  // Check if the flow type selected has data to show.
  const flowTypeData = data.flow_types[flowType];
  const flowTypeHasData = data.flow_types[flowType] !== undefined;

  return (
    <div className={styles.donuts}>
      {!noData &&
        ["P", "D", "R", "O", "General IHR", "Unspecified"].map(d => (
          <Donut
            numerator={
              flowTypeHasData
                ? parseFloat(flowTypeData.summaries[attributeType][d]) || 0
                : 0
            }
            denominator={flowTypeHasData ? flowTypeData.focus_node_weight : 0}
            attrFormatter={Util.getAttrFormatter(attributeType)}
            attribute={d}
          />
        ))}
      {noData && <span>No data available.</span>}
    </div>
  );
};

export default Donuts;
