import React from "react";
import Util from "../../misc/Util.js";
import { getWeightsBySummaryAttribute } from "../../misc/Data.js";
import styles from "./fundsbyyear.module.scss";

// Infographic components
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js";
import AreaLine from "../AreaLine/AreaLine.js";

// Data functions

// FC
const FundsByYear = ({ entityRole, data, flowTypeInfo, ...props }) => {
  // Check if no data and show message if none
  const noData = data === null;
  console.log("data - FundsByYear.js");
  console.log(data);
  return (
    <div className={styles.fundsByYear}>
      <div className={styles.content}>
        <div className={styles.totals}>
          <TotalByFlowType flowType="disbursed_funds" data={data} />
          <TotalByFlowType flowType="committed_funds" data={data} />
        </div>
        <div className={styles.areaLine}>
          <AreaLine
            flowTypeInfo={flowTypeInfo}
            data={getWeightsBySummaryAttribute({
              field: "year",
              flowTypes: ["disbursed_funds", "committed_funds"],
              data: [data]
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default FundsByYear;
