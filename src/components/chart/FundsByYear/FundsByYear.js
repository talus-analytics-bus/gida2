import React from "react";
import styles from "./fundsbyyear.module.scss";

// Infographic components
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js";

// FC
const FundsByYear = ({ startYear, endYear, entityType, data, ...props }) => {
  return (
    <div>
      <div className={styles.header}>
        Total funds {entityType} from {startYear} to {endYear}
      </div>
      <div className={styles.content}>
        <TotalByFlowType flowType="disbursed_funds" data={data} />
        <TotalByFlowType flowType="committed_funds" data={data} />
      </div>
    </div>
  );
};

export default FundsByYear;
