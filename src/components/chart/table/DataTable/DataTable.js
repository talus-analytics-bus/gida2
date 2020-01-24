import React from "react";
// import classNames from "classnames";
// import { Link } from "react-router-dom";
// import styles from "./entitytable.module.scss";
import TableInstance from "../../../chart/table/TableInstance.js";
import Pagination from "../../../common/Pagination/Pagination.js";

// FC for DataTable.
const DataTable = ({
  getTableData,
  pageSize,
  setLoadingSpinnerOn,
  ...props
}) => {
  const [curPage, setCurPage] = React.useState(1);
  const [nPages, setNPages] = React.useState(undefined);
  const [content, setContent] = React.useState(undefined);
  React.useEffect(() => {
    if (getTableData === undefined) return;
    setLoadingSpinnerOn(true, false, "DataTable");
    getTableData(curPage, pageSize).then(d => {
      setContent(
        <TableInstance
          {...{
            ...props,
            tableData: d.flows
          }}
        />
      );
      if (nPages === undefined) setNPages(d.paging.n_pages);
      else if (nPages !== d.paging.n_pages) {
        setCurPage(1);
        setNPages(d.paging.n_pages);
      }
      setLoadingSpinnerOn(false, false, "DataTable");
    });
  }, [getTableData, curPage]);

  // Return JSX
  if (content === undefined) return <div />;
  else
    return (
      <div>
        {<Pagination {...{ curPage, setCurPage, nPages }} />}
        {content}
      </div>
    );
};

export default DataTable;
