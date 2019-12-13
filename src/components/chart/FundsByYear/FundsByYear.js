import React from "react";
import { Link } from "react-router-dom";
import Util from "../../misc/Util.js";
import { getWeightsBySummaryAttribute } from "../../misc/Data.js";
import styles from "./fundsbyyear.module.scss";

// Infographic components
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js";
import AreaLine from "../AreaLine/AreaLine.js";

// Data functions

// FC
const FundsByYear = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  unknownDataOnly,
  noFinancialData,
  ...props
}) => {
  const linkToEntityTable = (
    <Link to={`/details/${id}/${entityRole}/table`}>
      <button>View table of funds</button>
    </Link>
  );
  return (
    <div className={styles.fundsByYear}>
      {!unknownDataOnly && !noFinancialData && (
        <div className={styles.content}>
          <div className={styles.totals}>
            <TotalByFlowType flowType="disbursed_funds" data={data} />
            <TotalByFlowType flowType="committed_funds" data={data} />
            {linkToEntityTable}
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
      )}
      {(unknownDataOnly || noFinancialData) && (
        <div className={styles.content}>
          <div className={styles.totals}>
            <span>
              No funding with specific amounts to show. Click "View table of
              funds" to view all available data.
            </span>
            {linkToEntityTable}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsByYear;
