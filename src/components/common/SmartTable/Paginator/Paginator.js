// standard packages
import React, { useState } from "react";

// assets and styles
import styles from "./paginator.module.scss";
import classNames from "classnames";
import { comma } from "../../../misc/Util";

/**
 * @method Paginator
 * Handle custom pagination for `Table` component
 */
export const Paginator = ({
  curPage,
  setCurPage,
  nTotalRecords,
  pagesize,
  setPagesize,
}) => {
  // constants
  // max records to show on 'All' selection
  const maxRecords = 1e9;

  // max pagination buttons to show at once
  const maxButtons = 9; // make odd
  const middleMax = (maxButtons - 1) / 2;

  // pagination buttons to show
  const numPages = Math.ceil(nTotalRecords / pagesize);

  /**
   * Numbered button that when clicked sets current page to that number
   * @method PageButton
   * @param  {[type]}   [label=null]          [description]
   * @param  {[type]}   [iconName=null]       [description]
   * @param  {[type]}   onClick               [description]
   * @param  {Object}   [customClassNames={}] [description]
   * @param  {[type]}   }                     [description]
   */
  const PageButton = ({
    control = false, // true if a control button, false if a number button
    label = null, // button label, the number
    iconName = null, // optional: name of material icon to show
    onClick, // callback fired when button clicked
    customClassNames = {}, // optional: key = class name, value = true if use
  }) => {
    // get material icon if any
    const icon =
      iconName !== null ? (
        <i className={classNames("material-icons")}>{iconName}</i>
      ) : null;

    const labelComponent = control ? <span>{label}</span> : label;

    // return page button
    return (
      <button
        className={classNames(styles.pageButton, customClassNames)}
        {...{ onClick }}
      >
        {icon}
        {labelComponent}
      </button>
    );
  };

  // add "first" and "next" buttons
  // add middle buttons

  let firstButtonNum = Math.max(
    Math.min(Math.max(curPage - middleMax, 1), numPages - maxButtons + 1),
    1
  );
  let lastButtonNum = Math.min(firstButtonNum + maxButtons - 1, numPages);

  const middleButtons = [];
  let i = firstButtonNum;
  while (i < lastButtonNum + 1) {
    const page = i;
    middleButtons.push(
      PageButton({
        label: comma(page),
        customClassNames: { [styles.selected]: curPage === page },
        onClick: () => {
          setCurPage(page);
        },
      })
    );
    i++;
  }

  const onLastPage = curPage >= numPages;
  const onFirstPage = curPage <= 1;

  // first page
  const firstButton = PageButton({
    label: "«",
    control: true,
    onClick: () => {
      if (!onFirstPage) setCurPage(1);
    },
    customClassNames: {
      [styles.disabled]: onFirstPage,
      [styles.control]: true,
    },
  });

  // previous page
  const prevButton = PageButton({
    control: true,
    label: "‹",
    onClick: () => {
      if (!onFirstPage) setCurPage(curPage - 1);
    },
    customClassNames: {
      [styles.disabled]: onFirstPage,
      [styles.control]: true,
    },
  });

  // next page
  const nextButton = PageButton({
    control: true,
    label: "›",
    onClick: () => {
      if (!onLastPage) setCurPage(curPage + 1);
    },
    customClassNames: {
      [styles.disabled]: onLastPage,
      [styles.control]: true,
    },
  });

  // last page
  const lastButton = PageButton({
    control: true,
    label: "»",
    onClick: () => {
      if (!onLastPage) setCurPage(numPages);
    },
    customClassNames: {
      [styles.disabled]: onLastPage,
      [styles.control]: true,
    },
  });

  // state
  // pagesize selector
  const pagesizeOptions = [
    {
      label: 5,
      value: 5,
    },
    {
      label: 10,
      value: 10,
    },
    {
      label: 25,
      value: 25,
    },
    {
      label: 50,
      value: 50,
    },
    {
      label: "All",
      value: maxRecords,
    },
  ];

  return (
    <div className={styles.paginator}>
      <div className={styles.leftSide}>
        <div className={styles.pagesizePicker}>
          <label>Page size</label>
          <select
            value={pagesize}
            onChange={e => {
              const v = e.target.value;
              setPagesize(v);
            }}
          >
            {pagesizeOptions.map(d => (
              <option value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.rowNumberTracker}>
          Showing {comma(curPage * pagesize - pagesize + 1)} to{" "}
          {comma(Math.min(curPage * pagesize, nTotalRecords))} of{" "}
          {comma(nTotalRecords)} rows
        </div>
      </div>
      <div className={styles.rightSide}>
        <div className={styles.pageButtons}>
          {firstButton}
          {prevButton}
          {middleButtons}
          {nextButton}
          {lastButton}
        </div>
      </div>
    </div>
  );
};

export default Paginator;
