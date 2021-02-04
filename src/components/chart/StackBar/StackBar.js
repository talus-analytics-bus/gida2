import React, { useState, useEffect } from "react";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import styles from "./stackbar.module.scss";
import ReactTooltip from "react-tooltip";
import {Loading} from "../../common";
import tooltipStyles from "../../common/tooltip.module.scss";
import * as d3 from "d3/dist/d3.min";
import D3StackBar from "./D3StackBar.js";
import RadioToggle from "../../misc/RadioToggle.js";
import { execute, Stakeholder, Assessment, NodeSums } from "../../misc/Queries";
import Legend from "../../map/Legend.js";
import { getMapColorScale } from "../../map/MapUtil.js";

// TEMP components
import SimpleTable from "../table/SimpleTable.js";

// FC
const StackBar = ({
  flowType,
  flowTypeName,
  otherNodeType,
  nodeType,
  ghsaOnly,
  id,
  render,
  placeType,
  staticStakeholders,
  otherDirection,
  ...props
}) => {
  const [data, setData] = useState([]);
  const [jeeScores, setJeeScores] = useState(null);
  const [processedData, setProcessedData] = useState(false);
  const [stackBar, setStackBar] = useState(null);
  const [stakeholders, setStakeholders] = useState(
    staticStakeholders !== undefined ? staticStakeholders : null
  );
  const [sort, setSort] = useState("amount"); // or jee
  const [tooltipData, setTooltipData] = useState(undefined);
  const [dataLoaded, setDataLoaded] = useState(false);

  const isGhsaPage = id === "ghsa";

  const jeeColorScale = getMapColorScale({
    supportType: "jee",
  });

  const getData = async () => {
    // core capacity bar chart filters
    const stackBarFilters = {
      "Core_Capacity.name": [["neq", "Unspecified"]],
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
    };
    if (!isGhsaPage) stackBarFilters["OtherStakeholder.id"] = [id];

    // top funder / recipient table
    const queries = {
      stackBar: NodeSums({
        format: "stack_bar_chart",
        direction: otherDirection, // "origin"
        group_by: "Core_Capacity.name",
        preserve_stakeholder_groupings: false,
        filters: stackBarFilters,
      }),
    };
    if (!isGhsaPage)
      queries.jeeScores = Assessment({
        format: "stack_bar_chart",
        scoreType: "JEE v1",
        id,
        fields: ["name", "value"],
      });
    if (staticStakeholders === undefined)
      queries.stakeholders = Stakeholder({ by: "id" });
    const results = await execute({ queries });
    if (staticStakeholders === undefined) {
      setStakeholders(results.stakeholders);
    }

    // TODO only request scores needed
    if (!isGhsaPage) setJeeScores(results.jeeScores);
    setData(results.stackBar.points);
    setDataLoaded(true);
  };

  const chartData = data.filter(
    d =>
      d[flowType] !== undefined &&
      d[flowType] !== "unknown" &&
      d.attribute !== "Unspecified"
  );

  // Show chart?
  const display = chartData.length > 0;
  const showJee = nodeType !== "origin";

  const legend =
    id !== "ghsa" && display && showJee ? (
      <Legend
        className={styles.legend}
        colorScale={jeeColorScale}
        supportType={"jee"}
        flowType={flowType}
        toggle={false}
        title={
          <div className={styles.legendTitle}>
            Average JEE score for core capacity
          </div>
        }
      />
    ) : (
      <div />
    );

  const stackBarParams = {
    flowType,
    flowTypeName,
    jeeScores,
    nodeType,
    otherNodeType,
    setTooltipData,
    tooltipClassName: styles.stackBarTooltip,
    sort,
    placeType,
  };
  useEffect(() => {
    if (render && stakeholders !== null && dataLoaded) {
      const stackBarNew = new D3StackBar("." + styles.stackBarChart, {
        ...stackBarParams,
        data: chartData,
      });
      setStackBar(stackBarNew);
    }
  }, [id, nodeType, ghsaOnly, render, dataLoaded, stakeholders]);

  useEffect(() => {
    if (stackBar !== null) {
      stackBar.updateStackBar(chartData, flowType, {
        ...stackBarParams,
      });
    }
  }, [flowType]);
  useEffect(() => {
    if (stackBar !== null) {
      stackBar.updateStackBar(chartData, flowType, {
        ...stackBarParams,
        sortOnly: true,
      });
    }
  }, [sort]);

  useEffect(() => {
    // on initial load, check for stakeholders data
    if (!dataLoaded) getData();
  }, [dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      setDataLoaded(false);
      setData([]);
      setJeeScores(null);
    }
  }, [id, otherDirection]);

  const jeeWhite = nodeType === "origin" || placeType !== "country";

  // const hasCorrectFlowType =
  //   data.length === 0 ? true : data[0][otherDirection] !== undefined;

  return (
    <Loading loaded={dataLoaded}>
      <div key={id + "-" + otherDirection} className={styles.stackbar}>
        {display && id !== "ghsa" && !jeeWhite && (
          <RadioToggle
            label={"Sort by"}
            callback={setSort}
            curVal={sort}
            choices={[
              {
                name: "Amount",
                value: "amount",
              },
              {
                name: "JEE score",
                value: "jee",
              },
            ]}
          />
        )}
        <div
          style={{
            visibility: display ? "visible" : "hidden",
            height: display ? "auto" : 0,
          }}
          className={styles.stackBarChart}
        />
        {!jeeWhite && legend}
        {!display && (
          <div>
            <i>No data to show</i>
          </div>
        )}
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
      </div>
    </Loading>
  );
};

export default StackBar;
