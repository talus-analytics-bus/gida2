import React from "react";
import { Cell } from "../";
import styles from "./row.module.scss";

export default function Row({ cellData, nCol, noData = false }) {
  return (
    <tr className={styles.row}>
      {!noData && cellData.map(cellDatum => <Cell {...{ cellDatum }} />)}
      {noData && (
        <td colspan={nCol} className={styles.noData}>
          No data
        </td>
      )}
    </tr>
  );
}
