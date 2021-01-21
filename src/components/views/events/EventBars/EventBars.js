// 3rd party libs
import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../../common/tooltip.module.scss";

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
      direction: "origin",
      filters: {
        "Event.id": [eventId],
        "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      },
    });
    const results = await execute({ queries });
    console.log("results");
    console.log(results);
    setData(results.nodeSums);
    // setData([
    //   { id: 0, value: 1000, name: "United States", iso3: "USA" },
    //   { id: 1, value: 2000, name: "Canada", iso3: "CAN" },
    // ]);
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
