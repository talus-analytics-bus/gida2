// 3rd party libs
import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";

import { Settings } from "../../../../App";

// styles
import styles from "./eventbars.module.scss";
import classNames from "classnames";

// utility
import { regions } from "../../../misc/Util";

// local libs
import D3EventBars from "./d3/D3EventBars";
import D3ImpactBars from "./d3/D3ImpactBars";
import { execute, NodeSums } from "../../../misc/Queries";
import Selectpicker from "../../../chart/Selectpicker/Selectpicker";
import { Loading, Checkbox, Popup, popupStyles } from "../../../common";

const EventBars = ({
  eventId,
  curFlowType,
  caseData,
  deathData,
  stakeholders,
}) => {
  // STATE //
  const [chart, setChart] = useState(null);
  const [secChart, setSecChart] = useState(null);
  const [data, setData] = useState(null);
  const [dataForChart, setDataForChart] = useState(null);
  const [caseDeathDataForChart, setCaseDeathDataForChart] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [tooltipData, setTooltipData] = useState(false);

  // "Event impact by"
  const [impact, setImpact] = useState("cases");

  // "Funds by"
  const [funds, setFunds] = useState("recipient_all");

  // "Filter recipients/funders"
  const [region, setRegion] = useState("");

  // show top 10 bars only?
  const [top10Only, setTop10Only] = useState(true);

  // CONSTANTS //
  // chart parameters
  const params = {
    setTooltipData,
    curFlowType,
    impact,
    role: funds.split("_")[0],
    stack: funds === "recipient_region",
  };

  // add countries with zero funding to main bar chart if they had cases?
  const addUnfundedCountriesWithCases =
    funds === "recipient_country" || funds === "recipient_region";

  // cases or deaths plotted?
  const impactData = impact === "cases" ? caseData : deathData;

  // show impacts dot chart?
  const showImpacts = ["recipient_country", "recipient_region"].includes(funds);

  // charts ready to be shown?
  const drawn = chart !== null && (!showImpacts || secChart !== null) && loaded;

  // was main chart initialized?
  const initialized = chart !== null;

  // direction of funding flow
  const direction = funds.startsWith("recipient") ? "target" : "origin";

  // recipient or funder?
  const roleNoun = direction === "target" ? "recipient" : "funder";

  // max number of bar chart bars to show
  const max = top10Only ? 10 : 1e6;

  // no data? shows a message to that effect
  const noData =
    dataForChart !== null && dataForChart[curFlowType].length === 0;

  // countries?
  const showRegionFilter =
    funds === "recipient_country" || funds === "funder_country";

  // FUNCTIONS //
  // get flag urls
  const getFlagUrl = (name, iso2) => {
    const showFlag =
      name !== "General Global Benefit" && name !== "Not reported";
    if (showFlag) {
      return `https://flags.talusanalytics.com/64px/${iso2}.png`;
    } else return null;
  };

  // return stakeholder dictionary keeping only those that match region filter
  // if applicable
  const getFilteredStakeholders = () => {
    if (!showRegionFilter || region === "") return stakeholders;
    else {
      const filteredStakeholders = {};
      for (const [k, v] of Object.entries(stakeholders)) {
        if (v.region_who === region) filteredStakeholders[k] = v;
      }
      return filteredStakeholders;
    }
  };

  const setStakeholderFilter = f => {
    const isAll = funds.endsWith("_all");
    const isCountries = showRegionFilter;
    const isRegions = funds === "recipient_region";
    const isOrgs = funds === "recipient_org" || funds === "funder_org";
    if (isAll) return;
    else {
      f["Stakeholder.slug"] = [
        ["neq", ["not-reported", "general-global-benefit"]],
      ];
    }
    if (isCountries) f["Stakeholder.subcat"] = ["country", "world"];
    else if (isRegions) {
      f["Stakeholder.subcat"] = ["country"];
    } else if (isOrgs) {
      f["Stakeholder.cat"] = ["organization"];
    } else {
      console.error("Unknown `funds` value: " + funds);
    }
  };
  // get data
  const getData = async () => {
    // define query filters
    const filters = {
      "Event.id": [eventId],
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
    };
    setStakeholderFilter(filters);

    // add region filter
    if (showRegionFilter && region !== "") {
      filters["Stakeholder.region_who"] = [region];
    }

    // define queries
    const queries = {};
    queries.nodeSums = NodeSums({
      format: "bar_chart",
      direction,
      filters,
    });
    const results = await execute({ queries });

    // add values that appear in case date but not funding
    setData(results.nodeSums);
  };

  // EFFECT HOOKS //
  // initialize charts when data are `loaded`
  useEffect(() => {
    if (loaded) {
      const newChart = new D3EventBars("." + styles.bars, {
        ...params,
        max,
        data: dataForChart[curFlowType],
      });

      const newSecChart = showImpacts
        ? new D3ImpactBars("." + styles.impacts, {
            ...params,
            max,
            data: caseDeathDataForChart,
          })
        : null;
      setChart(newChart);
      setSecChart(newSecChart);
    }
  }, [loaded, dataForChart, caseDeathDataForChart, top10Only]);

  // if both sets of required data are not null, mark as `loaded`
  useEffect(() => {
    if (dataForChart !== null && caseDeathDataForChart !== null) {
      setLoaded(true);
    }
  }, [data, caseDeathDataForChart]);

  // Format data.
  // if both sets of required raw data are not null, process them into data
  // that can be used in the charts
  useEffect(() => {
    if (data !== null && impactData !== null) {
      const dataByIso2 = {};
      data[curFlowType].forEach(d => {
        dataByIso2[d.iso2] = d;
      });
      const newCaseDeathDataForChartTmpByIso2 = {};

      // Get region-filtered stakeholders
      const filteredStakeholders = getFilteredStakeholders();

      // for each datum of case or death data, put it in chart data format
      // indexed by iso2 code
      impactData.forEach(({ value, ...d }) => {
        const iso3 = d.place_iso3 || d.iso3;
        const stakeholderInfo = filteredStakeholders[iso3];
        if (stakeholderInfo === undefined) return;
        else {
          const curShInfo = filteredStakeholders[iso3];
          d.iso2 = curShInfo.iso2;
          d.region_who = curShInfo.region_who;
          d.name = curShInfo.name;
        }
        const name = d.place_name || d.name;
        const iso2 = (d.iso2 || d.place_iso).toLowerCase();
        newCaseDeathDataForChartTmpByIso2[iso2] = {
          value,
          iso2,
          name,
          bar_id: `${iso2}-${curFlowType}-${impact}`,
          region_who: d.region_who,
        };
      });

      // reciprocally: add zeroes for funding for countries that had cases
      // but no funding listed
      const newDataForChart = {
        committed_funds: JSON.parse(JSON.stringify(data.committed_funds)),
        disbursed_funds: JSON.parse(JSON.stringify(data.disbursed_funds)),
      };
      if (addUnfundedCountriesWithCases) {
        for (const flowType of Object.keys(newDataForChart)) {
          impactData.forEach(d => {
            // if the case/death data place doesn't appear in the stakeholders
            // dataset, skip it, otherwise if it doesn't appear in the funding
            // dataset, add it with zero value
            let iso2 = (d.place_iso || d.iso2 || "none").toLowerCase();
            if (dataByIso2[iso2] === undefined) {
              const iso3 = d.place_iso3 || d.iso3;
              if (filteredStakeholders[iso3] === undefined) return;
              const shInfo = filteredStakeholders[iso3];
              let iso2 = (shInfo.iso2 || "none").toLowerCase();
              const name = shInfo.name || d.place_name || d.name;
              const newDatumForChart = {
                value: 0,
                iso2,
                bar_id: iso2 + "-" + flowType,
                id: shInfo.id,
                name,
                flag_url: getFlagUrl(name, iso2),
                region_who: shInfo.region_who,
              };

              newDataForChart[flowType].push(newDatumForChart);
            }
          });
        }
      }

      // add case / death value to funding data for sorting purposes
      newDataForChart[curFlowType].forEach(d => {
        if (newCaseDeathDataForChartTmpByIso2[d.iso2] !== undefined) {
          d.impact = newCaseDeathDataForChartTmpByIso2[d.iso2].value;
        } else d.impact = 0;
      });
      setDataForChart(newDataForChart);

      // if case/death data are not available for a place that is in the
      // funding dataset, add it as null
      const newCaseDeathDataForChart = [];
      newDataForChart[curFlowType].forEach(({ name, iso2, value, region }) => {
        if (newCaseDeathDataForChartTmpByIso2[iso2] === undefined) {
          newCaseDeathDataForChart.push({
            iso2,
            value: null,
            sort: value,
            name,
            bar_id: `${iso2}-${curFlowType}-${impact}`,
            region,
          });
        } else {
          newCaseDeathDataForChart.push({
            ...newCaseDeathDataForChartTmpByIso2[iso2],
            sort: value,
          });
        }
      });
      setCaseDeathDataForChart(newCaseDeathDataForChart);
    }
  }, [data, impactData, curFlowType]);

  // update bar chart when flow type is changed
  useEffect(() => {
    if (chart !== null && secChart !== null) {
      chart.update(data[curFlowType], curFlowType, {
        ...params,
        max,
      });
      secChart.update(caseDeathDataForChart, curFlowType, {
        ...params,
        max,
      });
    } else if (data === null) {
      getData();
    }
  }, [caseDeathDataForChart]);

  // update charts if fund type is changed
  useEffect(() => {
    if (initialized) {
      setLoaded(false);
      getData();
    }
  }, [funds, region]);

  // update second bar chart when impact is changed
  useEffect(() => {
    if (secChart !== null) {
      secChart.update(caseDeathDataForChart, curFlowType, {
        ...params,
        impact,
        max,
      });
    }
  }, [impact]);

  // JSX //
  return (
    <>
      <Loading {...{ loaded: drawn, position: "absolute", right: 0 }} />
      <div className={styles.eventBars}>
        {
          <div
            className={classNames(styles.charts, {
              [styles.shown]: drawn,
              [styles.one]: !showImpacts,
              [styles.two]: showImpacts,
            })}
          >
            <div className={styles.chart}>
              <div className={styles.dropdowns}>
                <Selectpicker
                  {...{
                    label: "Funds by",
                    curSelection: funds,
                    setOption: setFunds,
                    optionGroups: {
                      Recipient: [
                        {
                          value: "recipient_all",
                          label: "Recipient (all types)",
                        },
                        {
                          value: "recipient_country",
                          label: "Recipient (country)",
                        },
                        {
                          value: "recipient_region",
                          label: "Recipient (region)",
                        },
                        {
                          value: "recipient_org",
                          label: "Recipient (organization)",
                        },
                      ],
                      Funder: [
                        {
                          value: "funder_all",
                          label: "Funder (all types)",
                        },
                        { value: "funder_country", label: "Funder (country)" },
                        { value: "funder_org", label: "Funder (organization)" },
                      ],
                    },
                  }}
                />
                {showRegionFilter && (
                  <Selectpicker
                    {...{
                      label: `Filter ${roleNoun}s`,
                      curSelection: region,
                      setOption: setRegion,
                      optionList: [
                        { value: "", label: "All regions" },
                        { value: "afro", label: "African Region (AFRO)" },
                        {
                          value: "paho",
                          label: "Region of the Americas (PAHO)",
                        },
                        {
                          value: "searo",
                          label: "South-East Asia Region (SEARO)",
                        },
                        { value: "euro", label: "European Region (EURO)" },
                        {
                          value: "emro",
                          label: "Eastern Mediterranean Region (EMRO)",
                        },
                        {
                          value: "wpro",
                          label: "Western Pacific Region (WPRO)",
                        },
                      ],
                    }}
                  />
                )}
                {funds !== "recipient_region" &&
                  dataForChart !== null &&
                  dataForChart[curFlowType].length > 10 && (
                    <Checkbox
                      {...{
                        label: "Show top 10 only",
                        value: "top10only",
                        curChecked: top10Only,
                        callback: () => setTop10Only(!top10Only),
                        classes: [styles.checkbox],
                      }}
                    />
                  )}
              </div>
              <div
                className={classNames(styles.bars, { [styles.hidden]: noData })}
              />
            </div>
            <div className={styles.chart}>
              {showImpacts && (
                <>
                  <div className={styles.dropdowns}>
                    <Selectpicker
                      {...{
                        label: "Event impact by",
                        curSelection: impact,
                        setOption: setImpact,
                        optionList: [
                          { value: "cases", label: "Cases" },
                          { value: "deaths", label: "Deaths" },
                        ],
                      }}
                    />
                  </div>
                  <div
                    className={classNames(styles.impacts, {
                      [styles.hidden]: noData,
                    })}
                  />
                </>
              )}
            </div>
          </div>
        }
        {noData && (
          <div className={styles.noData}>
            No data match the selected filters
          </div>
        )}
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"chartTooltip"}
          type="light"
          className={popupStyles.container}
          place="top"
          effect="float"
          getContent={() => tooltipData && <Popup {...{ ...tooltipData }} />}
        />
      }
    </>
  );
};
export default EventBars;
