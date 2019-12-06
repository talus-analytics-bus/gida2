import React from "react";
import Util from "../../misc/Util.js";
import styles from "./totalbyflowtype.module.scss";

// FC for Details.
const TotalByFlowType = ({ flowType, data, ...props }) => {
  return (
    <div>
      <div>
        {Util.formatValue(getAmountByFlowType(flowType, data), flowType)}
      </div>
      <div>{Util.formatLabel(flowType)}</div>
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
