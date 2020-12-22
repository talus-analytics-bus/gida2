import * as d3 from "d3/dist/d3.min";
import React, { useState, useEffect } from "react";
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
  // define table `component` to return as table instance when data updated
  const [component, setComponent] = useState(null);

  // count number of data updates so key of table instance is incremented
  const [updateCount, setUpdateCount] = useState(0);

  /**
   * Build the table component, called each time `tableData` changes
   * @method buildTable
   * @param  {[type]}   tableData [description]
   * @return {[type]}             [description]
   */
  const buildTable = tableData => {
    const sortBy =
      sortByProp !== undefined
        ? {
            prop: sortByProp,
            order: props.sortOrder ? props.sortOrder : "descending",
          }
        : {};
    const initialDataTmp = useRowDataAsIs
      ? tableData
      : getTableRowData({
          tableRowDefs: tableColumns,
          data: tableData,
          filterFcn: filterFcn,
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
    return (
      <div
        className={classNames("tableInstance", styles.tableInstance, {
          noPaging: props.paging !== true,
          [styles.noNativePaging]: props.noNativePaging === true,
          [styles.noNativeSearch]: props.noNativePaging === true,
          [styles.noNativeSorting]: props.noNativeSorting === true,
          [styles.noNativePageSizeSelect]:
            props.noNativePageSizeSelect === true ||
            props.noNativePageSizeSelect === undefined,
        })}
      >
        <DataTable
          key={updateCount}
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

  // update table component whenever the data are changed
  useEffect(() => {
    setUpdateCount(updateCount + 1);
    setComponent(buildTable(tableData));
  }, [tableData, tableColumns]);
  return component;
};

export default TableInstance;
