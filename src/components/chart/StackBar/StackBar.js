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
              name: "attribute",
              display_name: "Core capacity"
            },
            {
              name: "disbursed_funds",
              display_name: "Disbursed funds"
            },
            {
              name: "committed_funds",
              display_name: "Committed funds"
            },
            {
              name: otherNodeType,
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
