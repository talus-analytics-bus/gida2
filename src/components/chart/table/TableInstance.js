import React from "react";
import classNames from "classnames";
import { DataTable } from "react-data-components";
import { getTableRowData } from "../../misc/Data.js";
// import styles from "./tableinstance.module.scss";

/**
 * Simple DataTable implementation
 * @method TableInstance
 */
const TableInstance = ({ tableColumns, tableData, ...props }) => {
  const buildTable = tableData => {
    return (
      <div className={classNames("tableInstance", "noPaging")}>
        <DataTable
          columns={tableColumns}
          initialData={getTableRowData(tableColumns, tableData)}
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
