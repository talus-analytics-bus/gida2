// 3rd party libs
import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../../common/tooltip.module.scss";
import { Settings } from "../../../../App";

// styles
import styles from "./eventbars.module.scss";
import classNames from "classnames";

// local libs
import D3EventBars from "./d3/D3EventBars";
import D3ImpactBars from "./d3/D3ImpactBars";
import { execute, NodeSums } from "../../../misc/Queries";
import Selectpicker from "../../../chart/Selectpicker/Selectpicker";
import Loading from "../../../common/Loading/Loading";

const COUNTRY_CATS = ["country", "world"];
const ORG_CATS = [
  "academia",
  "foundation",
  "government",
  "international_organization",
  "international_organization_",
  "ngo",
  "ngo_",
  "private_sector",
];

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
  const [funds, setFunds] = useState("recipient_country");

  // "Filter recipients/funders"
  const [region, setRegion] = useState("");

  // CONSTANTS //
  // chart parameters
  const params = { setTooltipData, curFlowType, impact };

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

  // FUNCTIONS //

  // return stakeholder dictionary keeping only those that match region filter
  // if applicable
  const getFilteredStakeholders = () => {
    if (region === "") return stakeholders;
    else {
      const filteredStakeholders = {};
      for (const [k, v] of Object.entries(stakeholders)) {
        if (v.region_who === region) filteredStakeholders[k] = v;
      }
      return filteredStakeholders;
    }
  };

  // return stakeholder categories that should be requested based on `funds`
  // (fund type to show)
  const getStakeholderCats = () => {
    if (funds === "recipient_country" || funds === "recipient_region")
      return COUNTRY_CATS;
    else if (funds === "recipient_org") return ORG_CATS;
    else if (funds === "funder") return COUNTRY_CATS.concat(ORG_CATS);
    else {
      console.error("Unknown `funds` value: " + funds);
    }
  };
  // get data
  const getData = async () => {
    // define query filters
    const filters = {
      "Event.id": [eventId],
      "Stakeholder.cat": getStakeholderCats(),
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
    };

    // add region filter
    if (region !== "") filters["Stakeholder.region_who"] = [region];

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
        data: dataForChart[curFlowType],
      });

      const newSecChart = showImpacts
        ? new D3ImpactBars("." + styles.impacts, {
            ...params,
            data: caseDeathDataForChart,
          })
        : null;
      setChart(newChart);
      setSecChart(newSecChart);
    }
  }, [loaded, dataForChart, caseDeathDataForChart]);

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
        if (d.iso2 === undefined && d.place_iso === undefined) {
          const stakeholderInfo = filteredStakeholders[d.iso3];
          if (stakeholderInfo === undefined) return;
          else d.iso2 = filteredStakeholders[d.iso3].iso2;
        }
        const name = d.place_name || d.name;
        const iso2 = (d.iso2 || d.place_iso).toLowerCase();
        newCaseDeathDataForChartTmpByIso2[iso2] = {
          value,
          iso2,
          name,
          bar_id: `${iso2}-${curFlowType}-${impact}`,
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
            if (dataByIso2[d.place_iso.toLowerCase()] === undefined) {
              if (filteredStakeholders[d.place_iso3] === undefined) return;
              const iso2 = d.place_iso.toLowerCase();
              newDataForChart[flowType].push({
                value: 0,
                iso2,
                flag_url: `https://flags.talusanalytics.com/64px/${iso2}.png`,
                bar_id: iso2 + "-" + flowType,
                id: filteredStakeholders[d.place_iso3].id,
                name: d.place_name,
              });
            }
          });
        }
      }
      setDataForChart(newDataForChart);

      // if case/death data are not available for a place that is in the
      // funding dataset, add it as null
      const newCaseDeathDataForChart = [];
      newDataForChart[curFlowType].forEach(({ name, iso2, value }) => {
        if (newCaseDeathDataForChartTmpByIso2[iso2] === undefined) {
          newCaseDeathDataForChart.push({
            iso2,
            value: null,
            sort: value,
            name,
            bar_id: `${iso2}-${curFlowType}-${impact}`,
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
      });
      secChart.update(caseDeathDataForChart, curFlowType, {
        ...params,
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
      });
    }
  }, [impact]);

  return (
    <>
      <Loading {...{ loaded: drawn }} />
      <div
        className={classNames(styles.eventBars, {
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
                optionList: [
                  { value: "recipient_country", label: "Recipient (country)" },
                  { value: "recipient_region", label: "Recipient (region)" },
                  { value: "funder", label: "Funder" },
                  { value: "recipient_org", label: "Recipient (organization)" },
                ],
              }}
            />
            <Selectpicker
              {...{
                label: "Filter [noun]",
                curSelection: region,
                setOption: setRegion,
                optionList: [
                  { value: "", label: "All regions" },
                  { value: "paho", label: "Region of the Americas (PAHO)" },
                ],
              }}
            />
          </div>
          <div className={styles.bars} />
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
              <div className={styles.impacts} />
            </>
          )}
        </div>
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"chartTooltip"}
          type="light"
          className={tooltipStyles.tooltip}
          place="top"
          effect="float"
          getContent={() =>
            tooltipData && (
              <table>
                {tooltipData.map(d => (
                  <tr>
                    <td>{d.field}:</td>&nbsp;<td>{d.value}</td>
                  </tr>
                ))}
              </table>
            )
          }
        />
      }
    </>
  );
};
export default EventBars;
