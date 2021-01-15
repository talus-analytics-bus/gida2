// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./eventnumbertotals.module.scss";
import dollarSvg from "./svg/dollar.svg";
import personSvg from "./svg/person.svg";

// local components
import SourceText from "../../../common/SourceText/SourceText";
import TotalByFlowType from "../../../infographic/TotalByFlowType/TotalByFlowType";

const EventFundingTotals = ({ type }) => {
  // FUNCTIONS //
  // get icon to show
  const getIcon = type => {
    if (type === "funding") return dollarSvg;
    else return personSvg;
  };
  // get totals to show
  const getTotalInfo = type => {
    if (type === "funding")
      return [
        ["Disbursed funding", "disbursed_funds"],
        ["Committed funding", "committed_funds"],
      ];
    else
      return [["Total cases", "total_cases"], ["Total deaths", "total_deaths"]];
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
            {totalInfo.map(([displayLabel, flowType]) => (
              <div className={styles.col}>
                <div className={styles.title}>{displayLabel}</div>
                <TotalByFlowType {...{ flowType, data: [], format: "event" }} />
              </div>
            ))}
          </div>
          <SourceText>Source: Placeholder</SourceText>
        </div>
      </div>
    </div>
  );
};
export default EventFundingTotals;
