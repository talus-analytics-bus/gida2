import React from "react";
import { HeaderCell } from "../";

export default function Header({ columns }) {
  return columns.map(colDatum => (
    <th>
      <HeaderCell {...{ colDatum }} />
    </th>
  ));
}
