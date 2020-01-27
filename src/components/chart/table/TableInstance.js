import * as d3 from "d3/dist/d3.min";
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
            order: props.sortOrder ? props.sortOrder : "descending"
          }
        : {};
    const initialDataTmp = useRowDataAsIs
      ? tableData
      : getTableRowData({
          tableRowDefs: tableColumns,
          data: tableData,
          filterFcn: filterFcn
        });

    let initialData =
      props.hide === undefined
        ? initialDataTmp
        : initialDataTmp.filter(d => !props.hide(d));
    if (sortByProp) {
      initialData.sort((a, b) => d3.descending(a[sortByProp], b[sortByProp]));
    }
    if (props.limit !== undefined)
      initialData = initialData.slice(0, props.limit);

    // console.log("initialData");
    // console.log(initialData);
    return (
      <div
        className={classNames("tableInstance", styles.tableInstance, {
          noPaging: props.paging !== true,
          [styles.noNativePaging]: props.noNativePaging === true,
          [styles.noNativeSearch]: props.noNativePaging === true,
          [styles.noNativeSorting]: props.noNativeSorting === true,
          [styles.noNativePageSizeSelect]:
            props.noNativePageSizeSelect === true ||
            props.noNativePageSizeSelect === undefined
        })}
      >
        <DataTable
          columns={tableColumns.filter(d => d.hide !== true)}
          initialData={initialData}
          initialPageLength={
            props.paging ? (props.pageLength ? props.pageLength : 10) : 1e6
          }
          paging={props.paging || false}
          initialSortBy={sortBy}
          buildRowOptions={props.tooltipFunc ? props.tooltipFunc : v => ""}
        />
      </div>
    );
  };
  const component = buildTable(tableData);
  return component;
};

export default TableInstance;
