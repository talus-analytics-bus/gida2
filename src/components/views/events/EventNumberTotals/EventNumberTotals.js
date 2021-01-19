// 3rd party libs
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// styles and assets
import styles from "./eventnumbertotals.module.scss";
import dollarSvg from "./svg/dollar.svg";
import personSvg from "./svg/person.svg";

// local components
import SourceText, { Website } from "../../../common/SourceText/SourceText";
import TotalByFlowType from "../../../infographic/TotalByFlowType/TotalByFlowType";
import { execute, CumulativeCasesOrDeaths, Flow } from "../../../misc/Queries";
import { NONE_VALS } from "../../../misc/Util";

const EventNumberTotals = ({ type, eventData, afterCaseData }) => {
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
        const newFundData = await Flow({
          filters: {
            "Project_Constants.events": [["has", [eventData.id]]],
          },
        });

        setFundData(newFundData.data);
        // setFundData([{ disbursed_funds: 9999 }]);
      };
    } else if (type === "total_cases") {
      return async () => {
        const data = await CumulativeCasesOrDeaths({
          casesOrDeaths: "cases",
          eventData,
        });
        if (afterCaseData !== undefined) {
          afterCaseData(
            data.map(d => {
              return { iso3: d.place_iso3 };
            })
          );
        }
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
  const isImpacts = type === "impacts";
  const hasImpactDataSources =
    isImpacts && eventData.cases_and_deaths_refs.length > 0;

  const impactDataSourcesNoun =
    hasImpactDataSources && eventData.cases_and_deaths_refs.length === 1
      ? "Source"
      : "Sources";
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
          {hasImpactDataSources && (
            <SourceText>
              {impactDataSourcesNoun}:{" "}
              {eventData.cases_and_deaths_refs.map(d => (
                <Website {...{ ...d }} />
              ))}
            </SourceText>
          )}
          {!isImpacts && (
            <SourceText>
              Source: <Link to={"/about/data"}>View sources</Link>
            </SourceText>
          )}
        </div>
      </div>
    </div>
  );
};
export default EventNumberTotals;
