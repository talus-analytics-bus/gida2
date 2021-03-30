import React from "react";
import { HeaderCell } from "../";
import styles from "./header.module.scss";

export default function Header({
  colData,
  sortCol,
  isDesc,
  setSortCol,
  setIsDesc,
}) {
  // set defeault width of columns
  const defaultWidth = `${100 / colData.length}%`;
  return (
    <tr className={styles.header}>
      {colData.map(colDatum => (
        <HeaderCell
          {...{
            colDatum,
            sortCol,
            isDesc,
            setSortCol,
            setIsDesc,
            style: { width: colData.width || defaultWidth },
          }}
        />
      ))}
    </tr>
  );
}
