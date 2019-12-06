import React from "react";
import styles from "./arealine.module.scss";

// TEMP components
import SimpleTable from "../table/SimpleTable.js";

// FC
const AreaLine = ({ data, ...props }) => {
  return (
    <div>
      {
        // TEMP table representing line chart data
        <SimpleTable
          colInfo={[
            {
              name: "attribute",
              display_name: "Year"
            },
            {
              name: "disbursed_funds",
              display_name: "Disbursed funds"
            },
            {
              name: "committed_funds",
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
