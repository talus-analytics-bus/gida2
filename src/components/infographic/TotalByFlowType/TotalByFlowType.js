import React from "react";
import classNames from "classnames";
import Util from "../../misc/Util.js";
import styles from "./totalbyflowtype.module.scss";

// FC for Details.
const TotalByFlowType = ({ flowType, data, ...props }) => {
  const amount = getAmountByFlowType(flowType, data);
  return (
    <div
      className={classNames(styles.totalByFlowType, {
        [styles.inline]: props.inline
      })}
    >
      <div
        className={classNames(styles.value, {
          [styles.unknown]: amount === "unknown"
        })}
      >
        {Util.formatValue(amount, flowType)}
      </div>
      <div className={styles.label}>
        {Util.formatLabel(flowType)}
        {props.label && <span>&nbsp;{props.label}</span>}
      </div>
    </div>
  );
};

const getAmountByFlowType = (flowType, data) => {
  if (data === undefined) return 0;
  else {
    if (data.length !== undefined) {
      // Add them up
      let total;
      data.forEach(d => {
        if (d.flow_types[flowType] === undefined) return;
        else {
          const curVal = d.flow_types[flowType].focus_node_weight;
          if (total === undefined) total = curVal;
          else if (curVal !== "unknown") total += curVal;
        }
      });
      if (total === undefined) return 0;
      else return total;
    } else {
      const flowTypeData = data[flowType];
      if (flowTypeData !== undefined) {
        return flowTypeData["focus_node_weight"];
      } else return 0;
    }
  }
};

export default TotalByFlowType;
