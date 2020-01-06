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
  useRowDataAsIs,
  filterFcn = d => true,
  ...props
}) => {
  // console.log("tableColumns");
  // console.log(tableColumns);
  // console.log("tableData");
  // console.log(tableData);
  const buildTable = tableData => {
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
          initialData={
            useRowDataAsIs
              ? tableData
              : getTableRowData({
                  tableRowDefs: tableColumns,
                  data: tableData,
                  filterFcn: filterFcn
                })
          }
          initialPageLength={props.initialPageLength || 1e6}
          paging={props.paging || false}
          pageLengthOptions={[5, 20, 50]}
          initialSortBy={sortBy}
        />
      </div>
    );
  };

  // React.useEffect(() => {
  //   console.log("\nMounted TableInstance");
  //   const clickableCells = document.getElementsByClassName("clickable");
  //   console.log("clickableCells");
  //   console.log(clickableCells);
  // }, []);

  return buildTable(tableData);
};

export default TableInstance;
