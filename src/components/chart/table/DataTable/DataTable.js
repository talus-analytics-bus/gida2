import React from "react";
// import classNames from "classnames";
// import { Link } from "react-router-dom";
// import styles from "./entitytable.module.scss";
import TableInstance from "../../../chart/table/TableInstance.js";
import NodeQuery from "../../../misc/NodeQuery.js";

// FC for DataTable.
const DataTable = ({
  getTableData = () => [],
  pageSize,
  updateData,
  updateConditions = [],
  ...props
}) => {
  const [curPage, setCurPage] = React.useState(1);
  const [content, setContent] = React.useState(undefined);

  React.useEffect(() => {
    getTableData(curPage, pageSize).then(d => {
      setContent(<TableInstance {...{ ...props, tableData: d.flows }} />);
    });
  }, [getTableData]);

  // Return JSX
  if (content === undefined) return <div />;
  else return <div>{content}</div>;
};

export default DataTable;
