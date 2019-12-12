import React from "react";
import Util from "../../misc/Util.js";
import styles from "./stackbar.module.scss";
import * as d3 from "d3/dist/d3.min";

// TEMP components
import SimpleTable from "../table/SimpleTable.js";

// FC
const StackBar = ({ data, flowType, otherNodeType, ...props }) => {
  return (
    <div className={styles.stackbar}>
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
              fmtName: "disbursed_funds",
              get: d => d.disbursed_funds,
              display_name: "Disbursed funds"
            },
            {
              fmtName: "committed_funds",
              get: d => d.committed_funds,
              display_name: "Committed funds"
            },
            {
              fmtName: otherNodeType,
              get: d => d[otherNodeType],
              display_name: otherNodeType === "target" ? "Recipient" : "Funder"
            }
          ]}
          data={data}
        />
      }
    </div>
  );
};

export default StackBar;
