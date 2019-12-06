import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donut.module.scss";

// FC
const Donut = ({ datum, denominator, valKey, attrFormatter, ...props }) => {
  console.log("datum[valKey]");
  console.log(datum[valKey]);
  return (
    <div className={styles.donut}>
      <div className={styles.content}>
        <div className={styles.value}>
          {Util.percentize(datum[valKey] / denominator)}
        </div>
        <div className={styles.label}>{attrFormatter(datum.attribute)}</div>
      </div>
    </div>
  );
};

export default Donut;
