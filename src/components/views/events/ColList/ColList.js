// 3rd party libs
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// styles
import styles from "./collist.module.scss";

const ColList = ({ items = [] }) => {
  // FUNCTIONS //
  const getListItemJsx = d => {
    if (d.url !== undefined) {
      return (
        <li>
          <Link to={d.url}>{d.label}</Link>
        </li>
      );
    } else return <li>{d.label}</li>;
  };

  // CONSTANTS //
  const list = (
    <ul className={styles.items}>
      {items.map(d => {
        return getListItemJsx(d);
      })}
    </ul>
  );

  // JSX //
  return (
    <div className={styles.colList}>
      <div className={styles.title}>Affected countries</div>
      {list}
    </div>
  );
};
export default ColList;
