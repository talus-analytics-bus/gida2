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
    if (d.label === undefined) return null;
    if (d.url !== undefined) {
      return (
        <span>
          <Link to={d.url}>{d.label}</Link>
        </span>
      );
    } else return <span>{d.label}</span>;
  };

  // CONSTANTS //
  const toggle = (
    <button className={styles.toggle} onClick={() => setViewAll(!viewAll)}>
      View {viewAll ? "fewer" : "all"}
    </button>
  );
  const itemsDefault = items.slice(0, max);
  const itemsMore = items.slice(max, items.length);

  const nItems = viewAll ? items.length : max;
  const list1 = items.slice(0, Math.ceil(nItems / 2)).map(d => {
    return getListItemJsx(d);
  });
  const list2 = items.slice(Math.ceil(nItems / 2), nItems + 1).map(d => {
    return getListItemJsx(d);
  });

  const list = (
    <div className={styles.items}>
      <div className={styles.itemCol}>{list1}</div>
      <div className={styles.itemCol}>{list2}</div>
      {items.length > max && toggle}
    </div>
  );

  // JSX //
  return (
    <div className={styles.colList}>
      <div className={styles.title}>
        Affected countries {items.length > 0 && <>({comma(items.length)})</>}
      </div>
      <Loading loaded={items.length > 0}>{list}</Loading>
    </div>
  );
};
export default ColList;
