// 3rd party libs
import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../../common/tooltip.module.scss";
import { Settings } from "../../../../App";

// styles
import styles from "./eventbars.module.scss";

// local libs
import D3EventBars from "./d3/D3EventBars";
import { execute, NodeSums } from "../../../misc/Queries";

const EventBars = ({ eventId, curFlowType }) => {
  // STATE //
  const [chart, setChart] = useState(null);
  const [data, setData] = useState(null);
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
        "Flow.flow_type": ["disbursed_funds", "committed_funds"],
        "Flow.year": [
          ["gt_eq", Settings.startYear],
          ["lt_eq", Settings.endYear],
        ],
      },
    });
    const results = await execute({ queries });
    setData(results.nodeSums);
    setLoaded(true);
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
      setChart(newChart);
    }
  }, [loaded]);

  // update bar chart when flow type is changed
  useEffect(() => {
    if (chart !== null) {
      chart.update(data[curFlowType], curFlowType, {
        ...params,
      });
    } else if (data === null) {
      getData();
    }
  }, [curFlowType]);

  return (
    <>
      <div className={styles.eventBars}>
        <div className={styles.bars} />
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
