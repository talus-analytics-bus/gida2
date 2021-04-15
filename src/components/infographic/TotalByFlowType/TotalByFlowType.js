import React, { useState, useEffect } from "react"
import classNames from "classnames"
import Util, { getInitCap } from "../../misc/Util.js"
import { Loading } from "../../common"
import styles from "./totalbyflowtype.module.scss"

// local components
import ObservationQuery from "../../misc/ObservationQuery"

// FC for Details.
const TotalByFlowType = ({ flowType, data, format, dataFunc, ...props }) => {
  const key = ["total_cases", "total_deaths"].includes(flowType)
    ? "value"
    : flowType

  // STATE //
  // const amount = "Unavailable";
  const amount = getAmountByFlowType(key, data)

  // FUNCTIONS //
  const getData = async () => {
    if (dataFunc !== undefined) await dataFunc()
  }

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
      getData()
    }
  }, [data])

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
  )
}

const financialFlowTypes = ["disbursed_funds", "committed_funds"]

const getAmountByFlowType = (flowType, data) => {
  if (data === undefined || data === null) return 0
  else if (data === "Unavailable") return "Unavailable"
  else {
    if (data.length !== undefined) {
      // Add them up
      let total
      if (!data.some(d => typeof d.value !== "string")) {
        return getInitCap(data[0].value)
      }
      data.forEach(d => {
        if (d[flowType] === undefined || d[flowType] === null) return
        else {
          const curVal = d[flowType]
          if (total === undefined) total = curVal
          else if (curVal !== "unknown") total += curVal
        }
      })
      if (total === undefined) {
        if (financialFlowTypes.includes(flowType)) return 0
        else return "Unavailable"
      } else return total
    } else {
      const flowTypeData = data[flowType]
      if (flowTypeData !== undefined) {
        return flowTypeData
      } else return 0
    }
  }
}

export default TotalByFlowType
