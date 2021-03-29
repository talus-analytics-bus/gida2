import React, { useState } from "react";
import { Paginator, Header, Body } from "./";
import styles from "./smarttable.module.scss";
export default function SmartTable({
  data,
  nTotalRecords,
  columns,
  pagesize,
  curPage,
  setPagesize,
  setCurPage,
}) {
  // transform data into rowData array
  const rowData = getRowData(data, columns);
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
          <Header {...{ columns }} />
          <Body {...{ rowData }} />
        </table>
      </div>
    );
}

const getRowData = (data, columns) => {
  const rowData = [];
  data.forEach(d => {
    const row = [];
    columns.forEach(c => {
      const value = c.func(d);
      row.push({
        value,
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
