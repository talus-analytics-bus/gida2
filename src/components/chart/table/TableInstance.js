import React from "react";
import classNames from "classnames";
import styles from "./tableinstance.module.scss";
import { DataTable } from "react-data-components";

/**
 * Simple table for displaying data (proof-of-concept)
 * @method SimpleTable
 */
const TableInstance = ({ tableColumns, tableData, ...props }) => {
  // renderUrl(val, row) {
  //   return (
  //     <a title={`Value: ${val}`} href={`/baseurl/${val}`}>
  //       <span
  //         style={{
  //           display: "inline-block",
  //           width: 92,
  //           whiteSpace: "nowrap",
  //           overflow: "hidden",
  //           textOverflow: "ellipsis"
  //         }}
  //       >
  //         {`Value: ${val}`}
  //       </span>
  //     </a>
  //   );
  // }

  const buildTable = tableData => {
    if (tableData.length === 0) return <div />;
    else
      return (
        <div className={classNames("tableInstance", "noPaging")}>
          <DataTable
            keys={"NAME"}
            columns={tableColumns}
            initialData={tableData}
            initialPageLength={props.initialPageLength || 1e6}
            paging={props.paging || false}
          />
        </div>
      );
    // pageLengthOptions={[5, 20, 50]}
  };

  return buildTable(tableData);
};

export default TableInstance;
