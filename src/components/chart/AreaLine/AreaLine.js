import React from "react";
import styles from "./arealine.module.scss";

// TEMP components
import SimpleTable from "../table/SimpleTable.js";

// FC
const AreaLine = ({ data, ...props }) => {
  console.log("data - AreaLine.js");
  console.log(data);
  return (
    <div>
      {
        // TEMP table representing line chart data
        <SimpleTable
          colInfo={[
            {
              fmtName: "attribute",
              get: d => d.attribute,
              display_name: "Year"
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
            }
          ]}
          data={data}
        />
      }
    </div>
  );
};

export default AreaLine;
