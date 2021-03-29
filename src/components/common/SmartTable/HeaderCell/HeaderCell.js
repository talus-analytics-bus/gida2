import React from "react";

export default function HeaderCell({
  colDatum,
  sortCol,
  isDesc,
  setSortCol,
  setIsDesc,
}) {
  return (
    <th
      onClick={() =>
        onClick({
          entity: colDatum.entity,
          colKey: colDatum.colKey,
          sortCol,
          isDesc,
          setSortCol,
          setIsDesc,
        })
      }
    >
      {colDatum.title}
    </th>
  );
}

const onClick = ({
  entity,
  colKey,
  sortCol,
  isDesc,
  setSortCol,
  setIsDesc,
}) => {
  // get new sort col
  const newSortCol = entity + "." + colKey;

  // if already sorting by this col, flip sort direction
  if (newSortCol === sortCol) setIsDesc(!isDesc);
  // otherwise, sort by this column ascending
  else {
    setSortCol(newSortCol);
    setIsDesc(false);
  }
};
