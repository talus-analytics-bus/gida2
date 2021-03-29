import React, { useState } from "react";
import { Paginator, Header, Body } from "./";
import styles from "./smarttable.module.scss";
export default function SmartTable({
  data,
  nTotalRecords,
  columns,
  curPage,
  pagesize,
  sortCol,
  isDesc,
  setPagesize,
  setCurPage,
  setSortCol,
  setIsDesc,
}) {
  // transform data into rowData array and colData array
  // TODO move this to EventTable since it is specific to that component
  const rowData = getRowData(data, columns);
  const colData = getColData(columns);
  if (data === null) return null;
  else
    return (
      <div className={styles.smartTable}>
        <Paginator
          {...{
            nTotalRecords,
            pagesize,
            curPage,
            setPagesize,
            setCurPage,
          }}
        />
        <table>
          <Header
            {...{
              colData,
              sortCol,
              isDesc,
              setSortCol,
              setIsDesc,
            }}
          />
          <Body {...{ rowData }} />
        </table>
      </div>
    );
}

// TODO move to EventTable
const getRowData = (data, columns) => {
  const rowData = [];
  data.forEach(d => {
    const row = [];
    columns.forEach(c => {
      const value = c.func(d);
      row.push({
        value,
        entity: c.entity,
        colKey: c.prop,
        type: c.type,
        title: c.title,
        valueFormatted: c.render(value),
      });
    });
    rowData.push(row);
  });
  return rowData;
};

// TODO move to EventTable
const getColData = columns => {
  const colData = [];
  columns.forEach(c => {
    colData.push({
      entity: c.entity,
      colKey: c.prop,
      type: c.type,
      title: c.title,
    });
  });
  return colData;
};
