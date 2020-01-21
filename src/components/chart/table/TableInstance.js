import React from "react";
import classNames from "classnames";
import { DataTable } from "react-data-components";
import { getTableRowData } from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import styles from "./tableinstance.module.scss";

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

  const buildTable = tableData => {
    const sortBy =
      sortByProp !== undefined
        ? {
            prop: sortByProp,
            order: "descending"
          }
        : {};
    const initialDataTmp = useRowDataAsIs
      ? tableData
      : getTableRowData({
          tableRowDefs: tableColumns,
          data: tableData,
          filterFcn: filterFcn
        });

    const initialData =
      props.hide === undefined
        ? initialDataTmp
        : initialDataTmp.filter(d => !props.hide(d));
    // console.log("initialData");
    // console.log(initialData);
    return (
      <div
        className={classNames("tableInstance", styles.tableInstance, {
          noPaging: props.paging !== true
        })}
      >
        <DataTable
          columns={tableColumns}
          initialData={initialData}
          initialPageLength={props.paging ? 10 : 1e6}
          paging={props.paging || false}
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
