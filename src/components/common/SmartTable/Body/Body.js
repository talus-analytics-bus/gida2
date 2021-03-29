import React from "react";
import { Row } from "../";
export default function Body({ rowData }) {
  return (
    <tbody>
      {rowData.map(cellData => (
        <Row
          {...{
            key: Object.values(cellData)
              .map(d => (d || "null").toString())
              .join("_"),
            cellData,
          }}
        />
      ))}
    </tbody>
  );
}
