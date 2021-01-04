import React from "react";
import classNames from "classnames";
import Util from "../../misc/Util.js";
import Loading from "../../common/Loading/Loading";
import styles from "./totalbyflowtype.module.scss";

// FC for Details.
const TotalByFlowType = ({ flowType, data, ...props }) => {
  const amount = getAmountByFlowType(flowType, data);
  return (
    <div
      className={classNames(styles.totalByFlowType, {
        [styles.inline]: props.inline,
      })}
    >
      <div
        className={classNames(styles.value, {
          [styles.unknown]: amount === "unknown",
        })}
      >
        <Loading loaded={data !== null}>
          {Util.formatValue(amount, flowType)}
        </Loading>
      </div>
      <div className={styles.label}>
        {Util.formatLabel(flowType)}
        {props.label && <span>&nbsp;{props.label}</span>}
      </div>
    </div>
  );
};

const getAmountByFlowType = (flowType, data) => {
  if (data === undefined || data === null) return 0;
  else {
    if (data.length !== undefined) {
      // Add them up
      let total;
      data.forEach(d => {
        if (d[flowType] === undefined) return;
        else {
          const curVal = d[flowType];
          if (total === undefined) total = curVal;
          else if (curVal !== "unknown") total += curVal;
        }
      });
      if (total === undefined) return 0;
      else return total;
    } else {
      const flowTypeData = data[flowType];
      if (flowTypeData !== undefined) {
        return flowTypeData;
      } else return 0;
    }
  }
};

export default TotalByFlowType;
