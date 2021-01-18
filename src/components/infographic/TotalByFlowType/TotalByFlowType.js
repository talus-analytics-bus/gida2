import React, { useState, useEffect } from "react";
import classNames from "classnames";
import Util from "../../misc/Util.js";
import Loading from "../../common/Loading/Loading";
import styles from "./totalbyflowtype.module.scss";

// local components
import ObservationQuery from "../../misc/ObservationQuery";

// FC for Details.
const TotalByFlowType = ({ flowType, data, format, dataFunc, ...props }) => {
  const key = ["total_cases", "total_deaths"].includes(flowType)
    ? "value"
    : flowType;

  // STATE //
  const amount = getAmountByFlowType(key, data);

  // FUNCTIONS //
  const getData = async () => {
    if (dataFunc !== undefined) await dataFunc();
  };

  // // FUNCTIONS //
  // // get data
  // const getData = async () => {
  //   // TODO replace with `dataFunc`
  //   const metric_id = 75;
  //   const queries = {
  //     chartData: ObservationQuery({
  //       metric_id,
  //       temporal_resolution: "daily",
  //       start_date: "2020-07-12",
  //       end_date: "2020-07-12",
  //       spatial_resolution: "country",
  //       place_name: "Italy",
  //     }),
  //   };
  //   const results = await execute({ queries });
  //   setChartData(results.chartData);
  // };

  // EFFECT HOOKS //
  useEffect(() => {
    if (data === null) {
      getData();
    }
  }, [data]);

  // JSX //
  return (
    amount !== null && (
      <div
        className={classNames(styles.totalByFlowType, {
          [styles.inline]: props.inline,
          [styles.event]: format === "event",
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
        {format !== "event" && (
          <div className={styles.label}>
            {Util.formatLabel(flowType)}
            {props.label && <span>&nbsp;{props.label}</span>}
          </div>
        )}
      </div>
    )
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
