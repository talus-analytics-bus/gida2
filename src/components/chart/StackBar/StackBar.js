import React from "react";
import Util from "../../misc/Util.js";
import styles from "./stackbar.module.scss";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../common/tooltip.module.scss";
import * as d3 from "d3/dist/d3.min";
import D3StackBar from "./D3StackBar.js";
import RadioToggle from "../../misc/RadioToggle.js";
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
  jeeScores,
  ghsaOnly,
  id,
  render,
  placeType,
  ...props
}) => {
  const [stackBar, setStackBar] = React.useState(null);
  const [sort, setSort] = React.useState("amount"); // or jee
  const [tooltipData, setTooltipData] = React.useState(undefined);

  const jeeColorScale = getMapColorScale({
    supportType: "jee",
  });

  const chartData = data.filter(
    d =>
      d[flowType] !== undefined &&
      d[flowType] !== "unknown" &&
      d.attribute !== "Unspecified"
  );

  // Show chart?
  const display = chartData.length > 0;
  const showJee = nodeType !== "source";

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
  React.useEffect(() => {
    if (render) {
      const stackBarNew = new D3StackBar("." + styles.stackBarChart, {
        ...stackBarParams,
        data: chartData,
      });
      setStackBar(stackBarNew);
    }
  }, [id, nodeType, ghsaOnly, render]);

  React.useEffect(() => {
    if (stackBar !== null) {
      stackBar.updateStackBar(chartData, flowType, {
        ...stackBarParams,
      });
    }
  }, [flowType]);
  React.useEffect(() => {
    if (stackBar !== null) {
      stackBar.updateStackBar(chartData, flowType, {
        ...stackBarParams,
        sortOnly: true,
      });
    }
  }, [sort]);

  const jeeWhite = nodeType === "source" || placeType !== "country";

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
