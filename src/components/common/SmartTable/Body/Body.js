import React from "react"
import { Row } from "../"
export default function Body({ colData, rowData, nCol }) {
  return (
    <tbody>
      {rowData.length > 0 &&
        rowData.map(cellData => (
          <Row
            {...{
              cellData,
            }}
          />
        ))}
      {rowData.length === 0 && <Row {...{ noData: true, nCol }} />}
    </tbody>
  )
}
