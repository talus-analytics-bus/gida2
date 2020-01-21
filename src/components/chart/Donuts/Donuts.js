import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donuts.module.scss";
// import * as d3 from "d3/dist/d3.min";

// Chart components
import Donut from "./Donut.js";

// FC
const Donuts = ({
  data,
  id,
  flowType,
  nodeType,
  attributeType,
  ghsaOnly,
  ...props
}) => {
  // If no data, return message to that effect.
  const noData = data === null;
  console.log("data");
  console.log(data);

  // Check if the flow type selected has data to show.
  const flowTypeData = data.flow_types[flowType];
  const flowTypeHasData =
    data.flow_types[flowType] !== undefined &&
    data.flow_types[flowType]["summaries"] !== undefined &&
    data.flow_types[flowType]["summaries"][attributeType] !== undefined &&
    Object.values(data.flow_types[flowType]["summaries"][attributeType]).some(
      d => d !== "unknown"
    );

  const display = flowTypeHasData;

  return (
    <div className={styles.donuts}>
      {display && (
        <div className={styles.donutContainer}>
          {["P", "D", "R", "O", "General IHR"].map((d, idx) => (
            <Donut
              idx={`num_${idx}`}
              numerator={
                flowTypeHasData
                  ? parseFloat(flowTypeData.summaries[attributeType][d]) || 0
                  : 0
              }
              denominator={flowTypeHasData ? flowTypeData.focus_node_weight : 0}
              attrFormatter={Util.getAttrFormatter(attributeType)}
              attribute={d}
              nodeType={nodeType}
              ghsaOnly={ghsaOnly}
              flowType={flowType}
            />
          ))}
        </div>
      )}
      {!display && (
        <div>
          <i>No data to show</i>
        </div>
      )}
    </div>
  );
};

export default Donuts;
