import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donuts.module.scss";
import * as d3 from "d3/dist/d3.min";

// Chart components
import Donut from "./Donut.js";

// FC
const Donuts = ({
  data,
  flowType,
  attributeType,
  donutDenominator,
  ...props
}) => {
  console.log("data - Donuts.js");
  console.log(data);

  // If no data, return message to that effect.
  const noData = data === null;

  return (
    <div className={styles.donuts}>
      {!noData &&
        [
          "Prevent",
          "Detect",
          "Respond",
          "Other",
          "General IHR Implementation",
          "Unspecified"
        ].map(d => (
          <Donut
            datum={data.find(
              dd => dd.attribute === d && dd[flowType] !== undefined
            )}
            denominator={donutDenominator}
            valKey={flowType}
            attrFormatter={Util.getAttrFormatter(attributeType)}
            attrVal={d}
          />
        ))}
      {noData && <span>No data available.</span>}
    </div>
  );
};

export default Donuts;
