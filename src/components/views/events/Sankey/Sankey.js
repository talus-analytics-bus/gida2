// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./sankey.module.scss";

// local components
import { Settings } from "../../../../App";
import D3Sankey from "./d3/D3Sankey";
import { execute, Chords } from "../../../misc/Queries";
import Selectpicker from "../../../chart/Selectpicker/Selectpicker";
import Checkbox from "../../../common/Checkbox/Checkbox";
import Loading from "../../../common/Loading/Loading";

const Sankey = ({ eventId, curFlowType }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [chart, setChart] = useState(null);
  const [chartData, setChartData] = useState(null);

  // FUNCTIONS //
  const getData = async () => {
    // define query filters
    const filters = {
      "Event.id": [eventId],
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
    };
    const queries = {
      chords: Chords({ format: "chord", filters }),
    };
    const results = await execute({ queries });
    setRawData(results.chords);
  };

  const processRawData = () => {
    console.log(rawData);
    const nodes = [
      {
        id: "a",
      },
      {
        id: "b",
      },
      {
        id: "c",
      },
    ];
    const links = [
      {
        source: "a",
        target: "c",
        value: 1,
      },
      {
        source: "b",
        target: "c",
        value: 2,
      },
    ];
    const graph = { nodes, links };
    setChartData(graph); // TODO
  };

  // CONSTANTS //
  const drawn = chart !== null && loaded;

  // chart params
  const params = {};

  // EFFECT HOOKS //
  // get raw data if null (initial load)
  useEffect(() => {
    if (rawData === null) {
      getData();
    } else {
      processRawData();
    }
  }, [rawData]);

  // render chart when data is processed
  useEffect(() => {
    if (chartData !== null) {
      const newChart = new D3Sankey("." + styles.sankey, {
        ...params,
        demo: true,
        data: chartData,
      });
    }
  }, [chartData]);

  // JSX //
  return (
    <>
      <Loading {...{ loaded: drawn, position: "absolute" }} />
      <div className={styles.sankey} />
    </>
  );
};
export default Sankey;
