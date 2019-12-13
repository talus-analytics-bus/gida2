import React from "react";
import classNames from "classnames";
import { DataTable } from "react-data-components";
// import styles from "./tableinstance.module.scss";

/**
 * Simple DataTable implementation
 * @method TableInstance
 */
const TableInstance = ({ tableColumns, tableData, ...props }) => {
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
            pageLengthOptions={[5, 20, 50]}
          />
        </div>
      );
  };

  return buildTable(tableData);
};

export default TableInstance;
