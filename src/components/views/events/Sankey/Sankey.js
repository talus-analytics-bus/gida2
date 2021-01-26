// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./sankey.module.scss";
import sortedAsc from "../../../../assets/images/icons/sorted-asc.svg";
import sortedDesc from "../../../../assets/images/icons/sorted-desc.svg";
import unsorted from "../../../../assets/images/icons/unsorted.svg";

// local components
import { Settings } from "../../../../App";
import D3Sankey from "./d3/D3Sankey";
import { execute, Chords } from "../../../misc/Queries";
import Selectpicker from "../../../chart/Selectpicker/Selectpicker";
import Checkbox from "../../../common/Checkbox/Checkbox";
import Loading from "../../../common/Loading/Loading";
import { ORG_CATS } from "../EventBars/EventBars";

const Sankey = ({ eventId, curFlowType }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [chart, setChart] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [sortFunder, setSortFunder] = useState(true);
  const [sortDesc, setSortDesc] = useState(true);
  const [region, setRegion] = useState("");

  // FUNCTIONS //
  const getData = async () => {
    // define query filters
    const filters = {
      "Event.id": [eventId],
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
    };
    // add region filter
    if (region !== "") {
      if (region !== "orgs") filters["Stakeholder.region_who"] = [region];
      else filters["Stakeholder.cat"] = ORG_CATS;
    }
    const queries = {
      chords: Chords({ format: "chord", filters }),
    };
    const results = await execute({ queries });
    setRawData(results.chords);
  };

  const processRawData = () => {
    // NODES //
    // get node data
    const nodesById = {};
    const toCheck = ["origin", "target"];
    const links = [];
    rawData
      .filter(
        d =>
          d[curFlowType] !== 0 &&
          d[curFlowType] !== null &&
          d[curFlowType] !== undefined
      )
      // .slice(0, 50)
      .forEach(d => {
        const value = d[curFlowType];
        const link = {};
        toCheck.forEach(role => {
          const id = `${d[role].id.toString()}-${role}`;
          if (nodesById[id] === undefined) {
            nodesById[id] = { ...d[role], id, role };
          }
          const dir = role === "origin" ? "source" : "target";
          link[dir] = id;
          link.value = value;
        });
        links.push(link);
      });
    const nodes = Object.values(nodesById);

    // // LINKS //
    // // TODO
    // const nodes = [
    //   {
    //     id: "a",
    //   },
    //   {
    //     id: "b",
    //   },
    //   {
    //     id: "c",
    //   },
    // ];
    // const links = [
    //   {
    //     source: "a",
    //     target: "c",
    //     value: 1,
    //   },
    //   {
    //     source: "b",
    //     target: "c",
    //     value: 2,
    //   },
    // ];
    const graph = { nodes, links };
    setChartData(graph); // TODO
  };

  // CONSTANTS //
  const drawn = chart !== null && loaded;

  // chart params
  const params = { sortDesc, sortFunder };

  // funders or recipients?
  const roleNoun = sortFunder ? "Funder" : "Recipient";

  // sort button standard params
  const sortParams = {
    sortFunder,
    setSortFunder,
    sortDesc,
    setSortDesc,
  };

  // EFFECT HOOKS //
  // get raw data if null (initial load)
  useEffect(() => {
    if (rawData === null) {
      getData();
    } else if (chartData === null) {
      processRawData();
    }
  }, [rawData, chartData]);

  // render chart when data is processed
  useEffect(() => {
    if (chartData !== null) {
      const newChart = new D3Sankey("." + styles.chart, {
        ...params,
        demo: true,
        data: chartData,
      });
      setChart(newChart);
    }
  }, [chartData]);

  // update entire chart when flow type is changed
  useEffect(() => {
    if (chart !== null) {
      setChart(null);
      setChartData(null);
    }
  }, [curFlowType, sortDesc, sortFunder]);

  // re-request data if filters change
  useEffect(() => {
    if (chart !== null) {
      setRawData(null);
      setChartData(null);
    }
  }, [region]);

  // JSX //
  return (
    <>
      <div className={styles.sankey}>
        <Loading {...{ loaded: true, position: "absolute" }} />
        <div className={styles.dropdowns}>
          <Selectpicker
            {...{
              label: `Filter ${roleNoun.toLowerCase()}s`,
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
                {
                  value: "orgs",
                  label: "Organizations only",
                },
              ],
            }}
          />
        </div>
        <div className={styles.sortButtons}>
          <Sort {...{ label: "Funder", ...sortParams }} />
          <Sort {...{ label: "Recipient", ...sortParams }} />
        </div>
        <div className={styles.chart} />
      </div>
    </>
  );
};

const Sort = ({ sortFunder, setSortFunder, sortDesc, setSortDesc, label }) => {
  // CONSTANTS //
  const isFunder = label === "Funder";
  const isSorted = (sortFunder && isFunder) || (!sortFunder && !isFunder);
  const isDesc = isSorted && sortDesc;
  const isAsc = isSorted && !sortDesc;
  const imgSrc = !isSorted ? unsorted : isDesc ? sortedDesc : sortedAsc;
  // FUNCTIONS //
  const onClick = () => {
    if (sortFunder && isFunder) setSortDesc(!sortDesc);
    else if (!sortFunder && !isFunder) setSortDesc(!sortDesc);
    else {
      setSortFunder(!sortFunder);
      setSortDesc(true);
    }
  };
  // JSX //
  return (
    <div onClick={onClick} className={styles.sortButton}>
      {label} <img src={imgSrc} />
    </div>
  );
};
export default Sankey;
