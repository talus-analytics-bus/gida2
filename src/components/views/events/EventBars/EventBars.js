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
  const [impact, setImpact] = useState("cases");
  // FUNCTIONS //
  // get data
  const getData = async () => {
    const queries = {};
    queries.nodeSums = NodeSums({
      format: "bar_chart",
      direction: "target",
      filters: {
        "Event.id": [eventId],
        "Stakeholder.cat": [
          "academia",
          "country",
          "foundation",
          "government",
          "international_organization",
          "international_organization_",
          "ngo",
          "ngo_",
          // "other",
          "private_sector",
          "world",
        ],
        "Flow.flow_type": ["disbursed_funds", "committed_funds"],
        "Flow.year": [
          ["gt_eq", Settings.startYear],
          ["lt_eq", Settings.endYear],
        ],
      },
    });
    const results = await execute({ queries });

    // add values that appear in case date but not funding
    setData(results.nodeSums);
  };

  // CONSTANTS //
  // chart parameters
  const params = { setTooltipData, curFlowType, impact };

  // cases or deaths plotted?
  const impactData = impact === "cases" ? caseData : deathData;

  // EFFECT HOOKS //
  // initialize charts when data are `loaded`
  useEffect(() => {
    if (loaded) {
      const newChart = new D3EventBars("." + styles.bars, {
        ...params,
        data: dataForChart[curFlowType],
      });
      const newSecChart = new D3ImpactBars("." + styles.impacts, {
        ...params,
        data: caseDeathDataForChart,
      });
      setChart(newChart);
      setSecChart(newSecChart);
    }
  }, [loaded]);

  // if both sets of required data are not null, mark as `loaded`
  useEffect(() => {
    if (dataForChart !== null && caseDeathDataForChart !== null) {
      setLoaded(true);
    }
  }, [data, caseDeathDataForChart]);

  // if both sets of required raw data are not null, process them into data
  // that can be used in the charts
  useEffect(() => {
    if (data !== null && impactData !== null) {
      const dataByIso2 = {};
      data[curFlowType].forEach(d => {
        dataByIso2[d.iso2] = d;
      });
      const newCaseDeathDataForChartTmpByIso2 = {};

      // for each datum of case or death data, put it in chart data format
      // indexed by iso2 code
      impactData.forEach(({ value, ...d }) => {
        if (d.iso2 === undefined && d.place_iso === undefined) {
          const stakeholderInfo = stakeholders[d.iso3];
          if (stakeholderInfo === undefined) return;
          else d.iso2 = stakeholders[d.iso3].iso2;
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
        committed_funds: data.committed_funds,
        disbursed_funds: data.disbursed_funds,
      };
      for (const flowType of Object.keys(newDataForChart)) {
        impactData.forEach(d => {
          // if the case/death data place doesn't appear in the stakeholders
          // dataset, skip it, otherwise if it doesn't appear in the funding
          // dataset, add it with zero value
          if (dataByIso2[d.place_iso.toLowerCase()] === undefined) {
            if (stakeholders[d.place_iso3] === undefined) return;
            const iso2 = d.place_iso.toLowerCase();
            newDataForChart[flowType].push({
              value: 0,
              iso2,
              flag_url: `https://flags.talusanalytics.com/64px/${iso2}.png`,
              bar_id: iso2 + "-" + flowType,
              id: stakeholders[d.place_iso3].id,
              name: d.place_name,
            });
          }
        });
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

  // update second bar chart when impact is changed
  useEffect(() => {
    if (secChart !== null) {
      secChart.update(caseDeathDataForChart, curFlowType, {
        ...params,
        impact,
      });
    }
  }, [impact]);

  const drawn = chart !== null && secChart !== null;

  return (
    <>
      <Loading {...{ loaded: drawn }} />
      <div className={classNames(styles.eventBars, { [styles.shown]: drawn })}>
        <div className={styles.chart}>
          <Selectpicker />
          <div className={styles.bars} />
        </div>
        <div className={styles.chart}>
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
          <div className={styles.impacts} />
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
