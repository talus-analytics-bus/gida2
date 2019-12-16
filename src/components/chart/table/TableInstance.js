import React from "react";
import classNames from "classnames";
import { DataTable } from "react-data-components";
import { getTableRowData } from "../../misc/Data.js";
import Util from "../../misc/Util.js";
// import styles from "./tableinstance.module.scss";

/**
 * Simple DataTable implementation
 * @method TableInstance
 */
const TableInstance = ({ tableColumns, tableData, ...props }) => {
  const buildTable = tableData => {
    // set table columns render functions if not set
    tableColumns.forEach(col => {
      if (col.render === undefined)
        col.render = v => Util.formatValue(v, col.prop);
    });
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
