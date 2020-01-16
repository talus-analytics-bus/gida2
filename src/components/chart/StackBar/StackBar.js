import React from "react";
import Util from "../../misc/Util.js";
import styles from "./stackbar.module.scss";
import * as d3 from "d3/dist/d3.min";
import D3StackBar from "./D3StackBar.js";

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
  const chartData = data.filter(
    d =>
      d[flowType] !== undefined &&
      d[flowType] !== "unknown" &&
      d.attribute !== "Unspecified"
  );
  React.useEffect(() => {
    const stackBarNew = new D3StackBar("." + styles.stackBarChart, {
      data: chartData,
      flowType,
      jeeScores,
      nodeType
      // oppNoun: nodeType === "target" ? "Funder" : "Recipient"
    });
    setStackBar(stackBarNew);
  }, []);

  React.useEffect(() => {
    if (stackBar !== null) {
      console.log("flowType = " + flowType);
      console.log("stackBar.update");
      console.log(stackBar.update);
      stackBar.updateStackBar(chartData, flowType, { jeeScores });
    }
  }, [flowType]);

  // React.useEffect(() => {
  //   if (stackBar !== null) {
  //     const chartData = data.filter(
  //       d =>
  //         d[flowType] !== undefined &&
  //         d[flowType] !== "unknown" &&
  //         d.attribute !== "Unspecified"
  //     );
  //     stackBar.update(chartData, flowType);
  //   }
  // }, [stackBar]);
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
    </div>
  );
};

export default StackBar;
