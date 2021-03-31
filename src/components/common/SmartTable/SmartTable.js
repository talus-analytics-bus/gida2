import React, { useState } from "react";
import { Paginator, Header, Body, TextSearch } from "./";
import { Button, Loading } from "../";
import styles from "./smarttable.module.scss";
export default function SmartTable({
  data,
  nTotalRecords,
  columns,
  curPage,
  pagesize,
  sortCol,
  isDesc,
  searchText,
  setPagesize,
  setCurPage,
  setSortCol,
  setIsDesc,
  setSearchText,
  loading = false,
  exportExcel,
}) {
  const [downloading, setDownloading] = useState(false);
  // transform data into rowData array and colData array
  // TODO move this to EventTable since it is specific to that component
  const rowData = getRowData(data, columns);
  const colData = getColData(columns);
  if (data === null) return null;
  else
    return (
      <div className={styles.smartTable}>
        <div className={styles.controls}>
          <TextSearch
            {...{
              searchText,
              placeholder: "search for keyword...",
              onChangeFunc: v => {
                setSearchText(v);
              },
            }}
          />
          {exportExcel && nTotalRecords !== 0 && (
            <div className={styles.exportExcel}>
              <Button
                {...{
                  label: !downloading ? (
                    <>
                      <span className={"glyphicon glyphicon-download-alt"} />
                      Download Excel
                    </>
                  ) : (
                    <>
                      <Loading
                        {...{
                          loaded: false,
                          tiny: true,
                        }}
                      />
                      <span>Downloading...</span>
                    </>
                  ),
                  type: "secondary",
                  onClick: () => {
                    setDownloading(true);
                    exportExcel().then(() => {
                      setDownloading(false);
                    });
                  },
                  disabled: downloading,
                }}
              />
            </div>
          )}
          <Paginator
            {...{
              nTotalRecords,
              pagesize,
              curPage,
              setPagesize,
              setCurPage,
              loading,
            }}
          />
        </div>
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
          <Body {...{ rowData, nCol: colData.length }} />
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
        valueFormatted: c.render !== undefined ? c.render(value) : value,
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
