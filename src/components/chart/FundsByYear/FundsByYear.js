import React from "react";
import Util from "../../misc/Util.js";
import styles from "./fundsbyyear.module.scss";

// Infographic components
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js";
import AreaLine from "../AreaLine/AreaLine.js";

// FC
const FundsByYear = ({
  startYear,
  endYear,
  entityType,
  data,
  flowTypeInfo,
  ...props
}) => {
  return (
    <div className={styles.fundsByYear}>
      <h2 className={styles.header}>
        Total funds {Util.getRoleTerm({ type: "adjective", role: entityType })}{" "}
        from {startYear} to {endYear}
      </h2>
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

/**
 * Totals weights by a particular summary attribute given a FlowBundle API
 * response.
 */
const getWeightsBySummaryAttribute = ({ field, flowTypes, data }) => {
  // If no data, return null
  if (data === undefined || data.length === 0) return null;

  // Define output object
  const output = {};

  // For each flow type
  flowTypes.forEach(ft => {
    // For each datum
    data.forEach(d => {
      const curFtData = d.flow_types[ft];
      if (curFtData === undefined) return;

      // get summaries
      const summaries = curFtData.summaries;

      // If summaries not defined, skip
      if (summaries === undefined) return;

      // If summary not provided for field, skip
      if (summaries[field] === undefined) return;

      console.log("summaries");
      console.log(summaries);
      // Otherwise, for each value in it
      for (let [k, v] of Object.entries(summaries[field])) {
        // If the value has not yet been seen, add it
        if (output[k] === undefined) output[k] = { [ft]: v, attribute: k };
        else {
          // Otherwise increment it or mark as unknown, as appropriate
          if (output[k][ft] === undefined || output[k][ft] === "unknown") {
            output[k][ft] = v;
          }
        }
      }
    });
  });

  // Format output as an array of objects (one object per row)
  return Object.values(output);
};

export default FundsByYear;
