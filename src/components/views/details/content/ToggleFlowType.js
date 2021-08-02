import React from "react"
import styles from "./toggleflowtype.module.scss"

export function ToggleFlowType({
  onChange,
  curFlowType,
  getFlowTypeLabel,
  flowTypeInfo,
  label = null,
}) {
  return (
    <form className={styles.toggleFlowType}>
      {label && <span className={styles.label}>{label}</span>}
      {["disbursed_funds", "committed_funds"].map(flowType => (
        <label onClick={onChange} for={flowType}>
          <input
            type="radio"
            name="radio"
            value={flowType}
            checked={curFlowType === flowType}
          />
          <span>{getFlowTypeLabel(flowType, flowTypeInfo)}</span>
        </label>
      ))}
    </form>
  )
}
