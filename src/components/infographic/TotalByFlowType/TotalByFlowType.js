import React from "react";
import Util from "../../misc/Util.js";
import styles from "./totalbyflowtype.module.scss";

// FC for Details.
const TotalByFlowType = ({ flowType, data, ...props }) => {
  return (
    <div className={styles.totalByFlowType}>
      <div className={styles.value}>
        {Util.formatValue(getAmountByFlowType(flowType, data), flowType)}
      </div>
      <div className={styles.label}>{Util.formatLabel(flowType)}</div>
    </div>
  );
};

const getAmountByFlowType = (flowType, data) => {
  if (data === undefined) return 0;
  else {
    const flowTypeData = data["flow_types"][flowType];
    if (flowTypeData !== undefined) {
      return flowTypeData["focus_node_weight"];
    } else return 0;
  }
};

export default TotalByFlowType;
