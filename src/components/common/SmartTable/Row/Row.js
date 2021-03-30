import React from "react";
import { Cell } from "../";
import styles from "./row.module.scss";

export default function Row({ cellData }) {
  return (
    <tr className={styles.row}>
      {cellData.map(cellDatum => (
        <Cell {...{ cellDatum }} />
      ))}
    </tr>
  );
}
