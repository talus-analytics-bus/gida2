import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donut.module.scss";

// FC
const Donut = ({
  numerator,
  denominator,
  attribute,
  attrFormatter,
  ...props
}) => {
  return (
    <div className={styles.donut}>
      <div className={styles.content}>
        <div className={styles.value}>
          {numerator !== 0
            ? Util.percentize(100 * (numerator / denominator))
            : "0%"}
        </div>
        <div className={styles.label}>{attrFormatter(attribute)}</div>
      </div>
    </div>
  );
};

export default Donut;
