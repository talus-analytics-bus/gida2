import React, { useState, useEffect } from "react";
import Util from "../../misc/Util.js";
import styles from "./stackbar.module.scss";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../common/tooltip.module.scss";
import * as d3 from "d3/dist/d3.min";
import D3StackBar from "./D3StackBar.js";
import RadioToggle from "../../misc/RadioToggle.js";
import { execute, Stakeholder, Assessment } from "../../misc/Queries";
import Legend from "../../map/Legend.js";
import { getMapColorScale } from "../../map/MapUtil.js";

// TEMP components
import SimpleTable from "../table/SimpleTable.js";

// FC
const StackBar = ({
  data,
  flowType,
  flowTypeName,
  otherNodeType,
  nodeType,
  ghsaOnly,
  id,
  render,
  placeType,
  staticStakeholders,
  ...props
}) => {
  const [jeeScores, setJeeScores] = useState(null);
  const [processedData, setProcessedData] = useState(false);
  const [stackBar, setStackBar] = useState(null);
  const [stakeholders, setStakeholders] = useState(
    staticStakeholders !== undefined ? staticStakeholders : null
  );
  const [sort, setSort] = useState("amount"); // or jee
  const [tooltipData, setTooltipData] = useState(undefined);
  const [dataLoaded, setDataLoaded] = useState(false);

  const jeeColorScale = getMapColorScale({
    supportType: "jee",
  });

  const getData = async () => {
    // top funder / recipient table
    const queries = {
      jeeScores: Assessment({
        scoreType: "JEE v1",
      }),
    };
    if (staticStakeholders === undefined)
      queries.stakeholders = Stakeholder({ by: "id" });
    const results = await execute({ queries });
    if (staticStakeholders === undefined) {
      setStakeholders(results.stakeholders);
    }

    // TODO only request scores needed
    setJeeScores(results.jeeScores[id]);
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
    if (stakeholders === null) getData();
  }, []);

  // useEffect(() => {
  //   if (
  //     chartData !== null &&
  //     stakeholders !== null &&
  //     chartData.processed !== true
  //   ) {
  //     chartData.processed = true;
  //     chartData.forEach(d => {
  //       console.log(d);
  //       const names = d[otherNodeType]
  //         .map(dd => {
  //           return stakeholders[dd].name;
  //         })
  //         .join("; ");
  //       d[otherNodeType] = names;
  //     });
  //   }
  // }, [chartData, stakeholders]);

  const jeeWhite = nodeType === "origin" || placeType !== "country";

  return (
    <div className={styles.stackbar}>
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
  );
};

export default StackBar;
