import React from "react";

export default function Cell({ cellDatum }) {
  return <td>{cellDatum.valueFormatted}</td>;
}
