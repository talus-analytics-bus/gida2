import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donut.module.scss";

// FC
const Donut = ({
  datum,
  denominator,
  valKey,
  attrVal,
  attrFormatter,
  ...props
}) => {
  return (
    <div className={styles.donut}>
      <div className={styles.content}>
        <div className={styles.value}>
          {datum !== undefined
            ? Util.percentize(100 * (datum[valKey] / denominator))
            : "0%"}
        </div>
        <div className={styles.label}>{attrFormatter(attrVal)}</div>
      </div>
    </div>
  );
};

export default Donut;
