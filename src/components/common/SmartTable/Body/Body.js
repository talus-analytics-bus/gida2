import React from "react";
import { Row } from "../";
export default function Body({ rowData, nCol }) {
  return (
    <tbody>
      {rowData.length > 0 &&
        rowData.map(cellData => (
          <Row
            {...{
              key: Object.values(cellData)
                .map(d => (d || "null").toString())
                .join("_"),
              cellData,
            }}
          />
        ))}
      {rowData.length === 0 && <Row {...{ noData: true, nCol }} />}
    </tbody>
  );
}
