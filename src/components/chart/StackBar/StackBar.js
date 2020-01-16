import React from "react";
import Util from "../../misc/Util.js";
import styles from "./stackbar.module.scss";
import * as d3 from "d3/dist/d3.min";
import D3StackBar from "./D3StackBar.js";
import ReactTooltip from "react-tooltip";

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
  ...props
}) => {
  const [stackBar, setStackBar] = React.useState(null);
  const [tooltipData, setTooltipData] = React.useState(undefined);
  const chartData = data.filter(
    d =>
      d[flowType] !== undefined &&
      d[flowType] !== "unknown" &&
      d.attribute !== "Unspecified"
  );
  const stackBarParams = {
    flowType,
    flowTypeName,
    jeeScores,
    nodeType,
    setTooltipData,
    tooltipClassName: styles.stackBarTooltip
  };
  React.useEffect(() => {
    const stackBarNew = new D3StackBar("." + styles.stackBarChart, {
      ...stackBarParams,
      data: chartData
    });
    setStackBar(stackBarNew);
  }, []);

  React.useEffect(() => {
    if (stackBar !== null) {
      stackBar.updateStackBar(chartData, flowType, {
        ...stackBarParams
      });
    }
  }, [flowType]);

  return (
    <div className={styles.stackbar}>
      <div className={styles.stackBarChart} />
      {
        // TEMP table representing stack bar chart data
        <SimpleTable
          colInfo={[
            {
              fmtName: "attribute",
              get: d => d.attribute,
              display_name: "Core capacity"
            },
            {
              fmtName: nodeType,
              get: d => d[nodeType],
              display_name: nodeType === "target" ? "Recipient" : "Funder"
            },
            {
              fmtName: otherNodeType,
              get: d => d[otherNodeType],
              display_name: otherNodeType === "target" ? "Recipient" : "Funder"
            },
            {
              fmtName: flowType,
              get: d => d[flowType],
              display_name: flowTypeName
            }
          ]}
          data={data}
          hide={d => {
            return d[flowType] !== undefined;
          }}
        />
      }
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"chartTooltip"}
          type="light"
          className={styles.stackBarTooltip}
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
