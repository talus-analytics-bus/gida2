import React from "react"

export default function Cell({ cellDatum }) {
  return <td key={cellDatum.colKey}>{cellDatum.valueFormatted}</td>
}
