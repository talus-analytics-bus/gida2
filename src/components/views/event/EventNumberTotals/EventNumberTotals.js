// 3rd party libs
import React, { useState } from "react";
import { Link } from "react-router-dom";

// styles and assets
import styles from "./eventnumbertotals.module.scss";
import classNames from "classnames";
import moneySvg from "./svg/bank-note.svg";
import personSvg from "./svg/person.svg";

// local components
import { SourceText } from "../../../common";
import TotalByFlowType from "../../../infographic/TotalByFlowType/TotalByFlowType";
import {
  execute,
  CumulativeCasesOrDeaths,
  NodeSums,
} from "../../../misc/Queries";
import { comma } from "../../../misc/Util";
import { WebsiteList } from "../../../common/SourceText/SourceText";

const EventNumberTotals = ({
  type,
  eventData,
  afterCaseData,
  caseData,
  setCaseData,
  deathData,
  setDeathData,

  // stakeholder filters
  id,
  role,

  // styling properties
  compact = false,
}) => {
  // STATE //
  // data arrays from which totals are calculated.
  // arrays should contain one el. per country with cumu. totals
  const [fundData, setFundData] = useState(null);
  const hasEventData = eventData !== undefined && eventData !== null;

  // FUNCTIONS //
  // get icon to show
  const getIcon = type => {
    if (type === "funding") return moneySvg;
    else return personSvg;
  };

  // get async data funcs. to retrieve data and set state
  const getDataFunc = type => {
    if (type.endsWith("_funds")) {
      return async () => {
        const filters = {
          "Flow.flow_type": ["disbursed_funds", "committed_funds"],
          "Flow.response_or_capacity": ["response"],
        };
        if (hasEventData) filters["Flow.events"] = [["has", [eventData.id]]];
        if (id !== undefined) filters["Stakeholder.id"] = [id];

        const queries = {
          byYear: NodeSums({
            format: "line_chart",
            direction: role === "funder" ? "origin" : "target",
            group_by: "Flow.year",
            filters,
          }),
        };
        const results = await execute({ queries });
        setFundData(results.byYear.totals);
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
    if (type === "funding")
      return [
        ["Committed funding", "committed_funds", fundData],
        ["Disbursed funding", "disbursed_funds", fundData],
      ];
    else {
      // if GLB is present then only use that
      const returnGlobalOnlyIfPresent = data => {
        if (data === null) return data;
        const globalDatum = data.find(d => d.iso3 === "GLB");
        if (globalDatum !== undefined) {
          // if hyphenated number, format accordingly
          const isHyphenatedNumber =
            typeof globalDatum.value === "string" &&
            globalDatum.value.includes("-");
          if (isHyphenatedNumber) {
            const formattedGlobalDatum = {
              ...globalDatum,
              value: globalDatum.value
                .split("-")
                .map(d => comma(d))
                .join(" - "),
            };
            return formattedGlobalDatum;
          }
          return [globalDatum];
        } else return data;
      };
      return [
        ["Total cases", "total_cases", returnGlobalOnlyIfPresent(caseData)],
        ["Total deaths", "total_deaths", returnGlobalOnlyIfPresent(deathData)],
      ];
    }
  };

  // CONSTANTS //
  const totalInfo = getTotalInfo(type);
  const isImpacts = type === "impacts";
  const hasImpactDataSources =
    isImpacts && hasEventData && eventData.cases_and_deaths_refs.length > 0;

  const impactDataSourcesNoun =
    hasImpactDataSources &&
    hasEventData &&
    eventData.cases_and_deaths_refs.length === 1
      ? "Source"
      : "Sources";
  return (
    <div
      className={classNames(styles.eventFundingTotals, {
        [styles.compact]: compact,
      })}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          <img
            className={type === "funding" ? styles.money : ""}
            src={getIcon(type)}
          />
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
              <span
                style={{
                  fontWeight:
                    hasEventData && eventData.cases_and_deaths_refs.length > 1
                      ? 600
                      : "",
                }}
              >
                {impactDataSourcesNoun}
              </span>
              <WebsiteList
                {...{
                  websites: hasEventData ? eventData.cases_and_deaths_refs : [],
                  linksOnly: false,
                }}
              />
            </SourceText>
          )}
          {/* {
          hasImpactDataSources && (
            <SourceText>
              {impactDataSourcesNoun}:{" "}
              {eventData.cases_and_deaths_refs.map(d => (
                <>
                  <SourceText.Website {...{ ...d }} />
                  {d.notes === "" ? ". " : ""}
                </>
              ))}
            </SourceText>
          )
          } */}
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
