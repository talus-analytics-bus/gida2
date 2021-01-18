// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./eventnumbertotals.module.scss";
import dollarSvg from "./svg/dollar.svg";
import personSvg from "./svg/person.svg";

// local components
import SourceText from "../../../common/SourceText/SourceText";
import TotalByFlowType from "../../../infographic/TotalByFlowType/TotalByFlowType";
import { execute, CumulativeCasesOrDeaths } from "../../../misc/Queries";

const EventNumberTotals = ({ type, eventData }) => {
  if (type === "impacts") {
    console.log("eventData");
    console.log(eventData);
  }
  // STATE //
  // data arrays from which totals are calculated.
  // arrays should contain one el. per country with cumu. totals
  const [fundData, setFundData] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [deathData, setDeathData] = useState(null);

  // FUNCTIONS //
  // get icon to show
  const getIcon = type => {
    if (type === "funding") return dollarSvg;
    else return personSvg;
  };

  // get async data funcs. to retrieve data and set state
  const getDataFunc = type => {
    if (type.endsWith("_funds")) {
      return async () => {
        setFundData([{ disbursed_funds: 9999 }]);
      };
    } else if (type === "total_cases") {
      return async () => {
        const data = await CumulativeCasesOrDeaths({
          casesOrDeaths: "cases",
          eventData,
        });
        setCaseData(data);
      };
    } else if (type === "total_deaths") {
      return async () => {
        const data = await CumulativeCasesOrDeaths({
          casesOrDeaths: "deaths",
          eventData,
        });
        setDeathData(data);
      };
    } else {
      console.error(`Unrecognized data type: ${type}`);
    }
  };

  // get totals to show
  const getTotalInfo = type => {
    const dataFunc = getDataFunc(type);
    if (type === "funding")
      return [
        ["Disbursed funding", "disbursed_funds", fundData],
        ["Committed funding", "committed_funds", fundData],
      ];
    else
      return [
        ["Total cases", "total_cases", caseData],
        ["Total deaths", "total_deaths", deathData],
      ];
  };

  // CONSTANTS //
  const totalInfo = getTotalInfo(type);

  return (
    <div className={styles.eventFundingTotals}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <img src={getIcon(type)} />
        </div>
        <div className={styles.rows}>
          <div className={styles.cols}>
            {totalInfo.map(([displayLabel, flowType, data]) => (
              <div className={styles.col}>
                <div className={styles.title}>{displayLabel}</div>
                <TotalByFlowType
                  {...{
                    key: flowType,
                    flowType,
                    data,
                    dataFunc: getDataFunc(flowType),
                    format: "event",
                  }}
                />
              </div>
            ))}
          </div>
          <SourceText>Source: Placeholder</SourceText>
        </div>
      </div>
    </div>
  );
};
export default EventNumberTotals;
