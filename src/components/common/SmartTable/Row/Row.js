import React from "react";
import { Cell } from "../";
export default function Row({ cellData }) {
  return (
    <tr>
      {cellData.map(cellDatum => (
        <Cell {...{ cellDatum }} />
      ))}
    </tr>
  );
}
