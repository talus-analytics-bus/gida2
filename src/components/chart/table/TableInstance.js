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
const TableInstance = ({
  tableColumns,
  tableData,
  sortByProp,
  filterFcn = d => true,
  ...props
}) => {
  const buildTable = tableData => {
    // set table columns render functions if not set
    tableColumns.forEach(col => {
      if (col.render === undefined)
        col.render = v => Util.formatValue(v, col.prop);
    });
    const sortBy =
      sortByProp !== undefined
        ? {
            prop: sortByProp,
            order: "descending"
          }
        : {};
    return (
      <div className={classNames("tableInstance", "noPaging")}>
        <DataTable
          columns={tableColumns}
          initialData={getTableRowData({
            tableRowDefs: tableColumns,
            data: tableData,
            filterFcn: filterFcn
          })}
          initialPageLength={props.initialPageLength || 1e6}
          paging={props.paging || false}
          pageLengthOptions={[5, 20, 50]}
          initialSortBy={sortBy}
        />
      </div>
    );
  };

  return buildTable(tableData);
};

export default TableInstance;
