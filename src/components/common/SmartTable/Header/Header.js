import React from "react";
import { HeaderCell } from "../";

export default function Header({
  colData,
  sortCol,
  isDesc,
  setSortCol,
  setIsDesc,
}) {
  return (
    <tr>
      {colData.map(colDatum => (
        <HeaderCell {...{ colDatum, sortCol, isDesc, setSortCol, setIsDesc }} />
      ))}
    </tr>
  );
}
