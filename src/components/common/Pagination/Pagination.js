import React from "react";
import classNames from "classnames";
import styles from "./pagination.module.scss";

/**
 * @method Pagination
 */
const Pagination = ({ curPage, setCurPage, nPages, ...props }) => {
  const prev = (
    <button
      onClick={() => {
        if (curPage > 1) setCurPage(curPage - 1);
      }}
    >
      Prev
    </button>
  );
  const next = (
    <button
      onClick={() => {
        if (curPage < nPages) setCurPage(curPage + 1);
      }}
    >
      Next
    </button>
  );
  return (
    <div className={styles.pagination}>
      {prev}
      {next}
    </div>
  );
};
export default Pagination;
