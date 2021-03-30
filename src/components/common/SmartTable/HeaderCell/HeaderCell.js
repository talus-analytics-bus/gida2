import React, { useState } from "react";
import styles from "./headercell.module.scss";

export default function HeaderCell({
  colDatum,
  sortCol,
  isDesc,
  setSortCol,
  setIsDesc,
  style = {},
}) {
  const [sortMode, setSortMode] = useState(
    getSortMode({
      entity: colDatum.entity,
      colKey: colDatum.colKey,
      sortCol,
      isDesc,
    })
  );

  return (
    <th
      style={style}
      className={styles.headerCell}
      onClick={() =>
        setNewSortParams({
          entity: colDatum.entity,
          colKey: colDatum.colKey,
          sortCol,
          isDesc,
          setSortCol,
          setIsDesc,
          setSortMode,
        })
      }
    >
      {colDatum.title}
      {<span className={"sort-icon sort-" + sortMode} />}
    </th>
  );
}

const setNewSortParams = ({
  entity,
  colKey,
  sortCol,
  isDesc,
  setSortCol,
  setIsDesc,
  setSortMode,
}) => {
  // get new sort col
  const newSortCol = entity + "." + colKey;

  // if already sorting by this col, flip sort direction
  if (newSortCol === sortCol) {
    setIsDesc(!isDesc);
    setSortMode(isDesc ? "ascending" : "descending");
  }
  // otherwise, sort by this column ascending
  else {
    setSortCol(newSortCol);
    setIsDesc(false);
    setSortMode("ascending");
  }

  // update sort mode
  if (newSortCol === sortCol) {
    setSortMode(isDesc ? "ascending" : "descending");
  }
  // otherwise, sort by this column ascending
  else {
    setSortMode("ascending");
  }
};

const getSortMode = ({ entity, colKey, sortCol, isDesc }) => {
  const thisSortCol = entity + "." + colKey;
  if (thisSortCol === sortCol) {
    if (isDesc) return "descending";
    else return "ascending";
  } else return "none";
};

const getCaret = (thisSorted, thisDesc) => {
  if (!thisSorted) return <span className={"sort-icon sort-none"} />;
  else if (thisDesc) return <span className={"sort-icon sort-descending"} />;
  else return <span className={"sort-icon sort-ascending"} />;
};