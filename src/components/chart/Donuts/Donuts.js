import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donuts.module.scss";
import * as d3 from "d3/dist/d3.min";

// Chart components
import Donut from "./Donut.js";

// FC
const Donuts = ({ data, flowType, attributeType, ...props }) => {
  return (
    <div className={styles.donuts}>
      {data.map(d => (
        <Donut
          datum={d}
          denominator={d3.sum(data, d => d[flowType])}
          valKey={flowType}
          attrFormatter={Util.getAttrFormatter(attributeType)}
        />
      ))}
    </div>
  );
};

export default Donuts;
