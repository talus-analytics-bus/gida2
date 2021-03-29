import React from "react";
import { HeaderCell } from "../";

export default function Header({
  colData,
  sortCol,
  isDesc,
  setSortCol,
  setIsDesc,
}) {
  return colData.map(colDatum => (
    <th>
      <HeaderCell {...{ colDatum, sortCol, isDesc, setSortCol, setIsDesc }} />
    </th>
  ));
}
