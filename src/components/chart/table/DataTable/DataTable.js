import React from "react";
// import classNames from "classnames";
// import { Link } from "react-router-dom";
// import styles from "./entitytable.module.scss";
import TableInstance from "../../../chart/table/TableInstance.js";
import {Pagination} from "../../../common";
import {Loading} from "../../../common";
import Util from "../../../misc/Util";

// FC for DataTable.
const DataTable = ({
  getTableData,
  pageSize,
  setLoadingSpinnerOn,
  rowCount,
  setRowCount,
  ...props
}) => {
  const [curPage, setCurPage] = React.useState(1);
  const [nPages, setNPages] = React.useState(undefined);
  const [content, setContent] = React.useState(undefined);
  const [curPageSize, setCurPageSize] = React.useState(pageSize);
  const [loaded, setLoaded] = React.useState(false);
  const [initLoaded, setInitLoaded] = React.useState(false);

  React.useEffect(() => {
    if (getTableData === undefined) return;
    setLoaded(false);
    getTableData(curPage, curPageSize).then(d => {
      setContent(
        <TableInstance
          {...{
            ...props,
            tableData: d.data,
          }}
        />
      );
      if (nPages === undefined) {
        setNPages(d.paging.n_pages);
      } else if (nPages !== d.paging.n_pages) {
        setCurPage(1);
        setNPages(d.paging.n_pages);
      }
      if (setRowCount !== undefined) {
        const newRowCount = (
          <span data-count={d.paging.n_records}>
            {" "}
            ({Util.comma(d.paging.n_records)})
          </span>
        );
        if (rowCount !== null) {
          if (rowCount.props["data-count"] !== d.paging.n_records)
            setRowCount(newRowCount);
        } else setRowCount(newRowCount);
      }
      setLoaded(true);
      if (!initLoaded) setInitLoaded(true);
    });
  }, [getTableData, curPage]);

  // Return JSX

  return (
    <div>
      {
        <Pagination
          {...{
            curPage,
            setCurPage,
            setCurPageSize,
            nPages,
            loaded,
            initLoaded,
          }}
        />
      }
      <Loading loaded={initLoaded}>{content}</Loading>
    </div>
  );
};

export default DataTable;
