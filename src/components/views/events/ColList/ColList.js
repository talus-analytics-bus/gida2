// 3rd party libs
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// styles
import styles from "./collist.module.scss";

// utility
import { comma } from "../../../misc/Util";

// local components
import Loading from "../../../common/Loading/Loading";

const ColList = ({ items = [], max = 10 }) => {
  // STATE //
  const [viewAll, setViewAll] = useState(false);

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
  const toggle = (
    <button className={styles.toggle} onClick={() => setViewAll(!viewAll)}>
      View {viewAll ? "fewer" : "all"}
    </button>
  );
  const globalCount =
    items.length > max ? (
      <div className={styles.globalCount}>
        <span className={styles.global}>Global</span>
        <span className={styles.count}> ({comma(items.length)} countries)</span>
      </div>
    ) : null;
  const itemsDefault = items.slice(0, max);
  const itemsMore = items.slice(max, items.length);
  const list = (
    <ul className={styles.items}>
      {itemsDefault.map(d => {
        return getListItemJsx(d);
      })}
      {viewAll &&
        itemsMore.map(d => {
          return getListItemJsx(d);
        })}
      {items.length > max && toggle}
    </ul>
  );

  // JSX //
  return (
    <div className={styles.colList}>
      <div className={styles.title}>Affected countries</div>
      <Loading loaded={items.length > 0}>
        {globalCount}
        {list}
      </Loading>
    </div>
  );
};
export default ColList;
