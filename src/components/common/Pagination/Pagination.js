import React from "react";
import classNames from "classnames";
import styles from "./pagination.module.scss";
import Util from "../../misc/Util.js";

/**
 * @method Pagination
 */
const Pagination = ({
  curPage,
  setCurPage,
  nPages,
  showPageNum = false,
  ...props
}) => {
  const prev = (
    <button
      disabled={curPage === 1}
      onClick={() => {
        if (curPage > 1) setCurPage(curPage - 1);
      }}
    >
      <span className={classNames("fa fa-angle-left")} />
    </button>
  );
  const next = (
    <button
      disabled={curPage >= nPages}
      onClick={() => {
        if (curPage < nPages) setCurPage(curPage + 1);
      }}
    >
      <span className={classNames("fa fa-angle-right")} />
    </button>
  );
  const end = (
    <button
      disabled={curPage >= nPages}
      onClick={() => {
        if (curPage < nPages) setCurPage(nPages);
      }}
    >
      <span className={classNames("fa fa-angle-double-right")} />
    </button>
  );
  const start = (
    <button
      disabled={curPage === 1}
      onClick={() => {
        if (curPage > 1) setCurPage(1);
      }}
    >
      <span className={classNames("fa fa-angle-double-left")} />
    </button>
  );
  const pageButtons = [];
  for (let i = curPage - 5; i <= curPage + 5; i++) {
    if (i < 1) i = curPage;
    pageButtons.push(i);
    if (i === nPages) break;
  }

  if (nPages === 0) return <div />;
  else
    return (
      <div className={styles.pagination}>
        <div className={styles.pageButtons}>
          {start}
          {prev}
          {pageButtons.map(i => (
            <button
              onClick={() => setCurPage(i)}
              className={classNames({ [styles.selected]: i === curPage })}
            >
              {Util.comma(i)}
            </button>
          ))}
          {next}
          {end}
        </div>
        {showPageNum && (
          <div className={styles.pageNum}>
            Page {Util.comma(curPage)} of {Util.comma(nPages)}
          </div>
        )}
      </div>
    );
};
export default Pagination;
