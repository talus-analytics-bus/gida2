// 3rd party libs
import React, { useState, useEffect, useRef } from "react";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../../common/tooltip.module.scss";
import classNames from "classnames";

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
  const [max, setMax] = useState(5);
  const [tooltipData, setTooltipData] = useState(false);
  const [noData, setNoData] = useState(false);
  const [marginLeft, setMarginLeft] = useState(0);
  const [marginRight, setMarginRight] = useState(0);
  const [clicked, setClicked] = useState(null);
  const clickedRef = useRef(null);

  // TODO setClicked(null) on clicking outside chart

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
      const stakeholderEntity = sortFunder ? "Stakeholder" : "OtherStakeholder";
      if (region !== "orgs")
        filters[`${stakeholderEntity}.region_who`] = [region];
      else filters[`${stakeholderEntity}.cat`] = ORG_CATS;
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
      .forEach(d => {
        const value = d[curFlowType];
        const link = {};
        toCheck.forEach(role => {
          const nodeId = `${d[role].id.toString()}-${role}`;
          if (nodesById[nodeId] === undefined) {
            nodesById[nodeId] = { ...d[role], nodeId, role };
          }
          const dir = role === "origin" ? "source" : "target";
          link[dir] = nodeId;
          link.value = value;
        });
        links.push(link);
      });
    const nodes = Object.values(nodesById);
    const graph = { nodes, links };
    setChartData(graph);
  };

  // CONSTANTS //
  const drawn = chart !== null && loaded;
  const sortedSide = sortFunder ? "left" : "right";

  // x-axis label
  const xLabel =
    curFlowType === "disbursed_funds"
      ? "Disbursed funds (USD)"
      : "Committed funds (USD)";

  // chart params
  const params = {
    sortDesc,
    sortFunder,
    max,
    setTooltipData,
    xLabel,
    setMarginLeft,
    setMarginRight,
    labelShift: 10,
    clicked,
    setClicked,
  };

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
  // on click anywhere but in menu, and menu is shown, close menu; otherwise
  // do nothing
  useEffect(() => {
    document.getElementById("root").onclick = e => {
      const clickedOtherChartElement =
        e.target.tagName === "path" ||
        e.target.tagName === "svg" ||
        +e.target.dataset.index === clicked;
      const clickedSelect = e.target.tagName === "SELECT";
      if (clickedSelect || clickedRef === null || clickedRef.current === null)
        return;
      const clickedPos = clickedRef.current;
      if (!clickedOtherChartElement && clickedPos.contains(e.target)) return;
      else {
        setClicked(null);
        if (chart !== null) chart.removeClicked();
      }
    };
  }, [clicked]);

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
      const curNoData = chartData.nodes.length === 0;
      const switchingFromNoDataToData = !curNoData && noData;
      setNoData(curNoData);
      // if switching from "no data" to "data" be sure to
      if (!switchingFromNoDataToData) {
        setNoData(curNoData);
        const newChart = new D3Sankey("." + styles.chart, {
          ...params,
          data: chartData,
        });
        setChart(newChart);
      }
    }
  }, [chartData, noData]);

  // update entire chart when flow type or other params are  changed
  useEffect(() => {
    if (chart !== null) {
      setChart(null);
      setChartData(null);
    }
  }, [curFlowType, sortDesc, max]);

  // re-request data if filters change
  useEffect(() => {
    if (chart !== null) {
      setRawData(null);
      setChartData(null);
    }
  }, [region, sortFunder]);

  // JSX //
  return (
    <>
      <div className={styles.sankey}>
        <Loading {...{ loaded: true, position: "absolute" }} />
        <div
          style={{ marginLeft, marginRight }}
          className={classNames(styles.dropdowns, styles[sortedSide])}
        >
          <Selectpicker
            {...{
              label: `Filter ${roleNoun.toLowerCase()}s`,
              curSelection: region,
              setOption: setRegion,
              optionList: [
                { value: "", label: "All stakeholders" },
                {
                  value: "orgs",
                  label: "Organizations only",
                },
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
        </div>
        <div className={styles.sortButtons}>
          <Sort {...{ label: "Funder", ...sortParams }} />
          <Sort {...{ label: "Recipient", ...sortParams }} />
        </div>
        <div
          ref={clickedRef}
          style={{
            height: noData ? 0 : undefined,
            marginBottom: noData ? 0 : undefined,
          }}
          className={styles.chart}
        />
        {noData && (
          <div className={styles.noDataMessage}>
            No {roleNoun.toLowerCase()} data for {curFlowType.replace("_", " ")}{" "}
            match the selected filters
          </div>
        )}
        <div className={styles.dropdowns}>
          <Selectpicker
            {...{
              label: null,
              curSelection: max,
              setOption: setMax,
              optionList: [
                { value: 5, label: "Show top 5" },
                { value: 10, label: "Show top 10" },
                {
                  value: Infinity,
                  label: "Show all",
                },
              ],
            }}
          />
        </div>
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"sankeyTooltip"}
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
                {tooltipData.footer && <i>{tooltipData.footer}</i>}
              </table>
            )
          }
        />
      }
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
    <div
      onClick={onClick}
      className={classNames(styles.sortButton, { [styles.grayed]: !isSorted })}
    >
      <span>{label}</span> <img src={imgSrc} />
    </div>
  );
};
export default Sankey;
