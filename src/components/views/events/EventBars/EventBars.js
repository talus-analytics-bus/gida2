// 3rd party libs
import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../../common/tooltip.module.scss";
import { Settings } from "../../../../App";

// styles
import styles from "./eventbars.module.scss";

// local libs
import D3EventBars from "./d3/D3EventBars";
import D3ImpactBars from "./d3/D3ImpactBars";
import { execute, NodeSums } from "../../../misc/Queries";

const EventBars = ({ eventId, curFlowType, caseData, deathData }) => {
  // STATE //
  const [chart, setChart] = useState(null);
  const [secChart, setSecChart] = useState(null);
  const [data, setData] = useState(null);
  const [caseDataForChart, setCaseDataForChart] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [tooltipData, setTooltipData] = useState(false);
  // FUNCTIONS //
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
    setData(results.nodeSums);
  };

  // CONSTANTS //
  const params = { setTooltipData, curFlowType };

  // EFFECT HOOKS //
  // initialize
  useEffect(() => {
    if (loaded) {
      const newChart = new D3EventBars("." + styles.bars, {
        ...params,
        data: data[curFlowType],
      });
      const newSecChart = new D3ImpactBars("." + styles.impacts, {
        ...params,
        data: caseDataForChart,
      });
      setChart(newChart);
      setSecChart(newSecChart);
    }
  }, [loaded]);

  useEffect(() => {
    if (data !== null && caseDataForChart !== null) {
      setLoaded(true);
    }
  }, [data, caseDataForChart]);

  useEffect(() => {
    if (data !== null && caseData !== null) {
      if (data !== null && caseData !== null) {
        const dataByIso2 = {};
        data[curFlowType].forEach(d => {
          dataByIso2[d.iso2] = d;
        });
        const newCaseDataForChartTmpByIso2 = {};
        const newCaseDataForChartTmp = caseData.map(
          ({ value, place_name, ...d }) => {
            const iso2 = d.place_iso.toLowerCase();
            newCaseDataForChartTmpByIso2[iso2] = {
              value,
              iso2,
              name: place_name,
              bar_id: iso2 + "-" + curFlowType,
            };
            return {
              value,
              iso2,
              name: place_name,
              bar_id: iso2 + "-" + curFlowType,
            };
          }
        );
        const newCaseDataForChart = [];
        data[curFlowType].forEach(({ name, iso2, value }) => {
          if (newCaseDataForChartTmpByIso2[iso2] === undefined) {
            newCaseDataForChart.push({
              iso2,
              value: 0,
              sort: value,
              name,
              bar_id: iso2 + "-" + curFlowType,
            });
          } else {
            newCaseDataForChart.push({
              ...newCaseDataForChartTmpByIso2[iso2],
              sort: value,
            });
          }
        });
        console.log("newCaseDataForChart");
        console.log(newCaseDataForChart);
        setCaseDataForChart(newCaseDataForChart);
      }
    }
  }, [data, caseData, curFlowType]);

  // update bar chart when flow type is changed
  useEffect(() => {
    if (chart !== null && secChart !== null) {
      chart.update(data[curFlowType], curFlowType, {
        ...params,
      });
      secChart.update(caseDataForChart, curFlowType, {
        ...params,
      });
    } else if (data === null) {
      getData();
    }
  }, [caseDataForChart]);

  return (
    <>
      <div className={styles.eventBars}>
        <div className={styles.bars} />
        <div className={styles.impacts} />
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
