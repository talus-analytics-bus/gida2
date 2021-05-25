import React from "react"
import styles from "./chevron.module.scss"

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Chevron
 */
const Chevron = ({ type, ...props }) => {
  const funder = (
    <svg width="30px" height="30px" className={styles.chevron}>
      <path
        d="M2.5,25.75A2.25,2.25,0,0,1,.25,23.5V2.5A2.25,2.25,0,0,1,2.5.25H17.72a.24.24,0,0,1,.21.11l8.42,12.9a.26.26,0,0,1,0,.29l-9.42,12.1a.26.26,0,0,1-.2.1Z"
        className={styles.funder}
      />
      <text transform="translate(5, 19)">$</text>
    </svg>
  )
  const recipient = (
    <svg width="30px" height="30px" className={styles.chevron}>
      <path
        d="M.5,25.75a.23.23,0,0,1-.22-.14.22.22,0,0,1,0-.26L9.48,13.5l-.35-.58C8,11.06,4.53,6,2.44,3,.75.6.75.6.75.5A.25.25,0,0,1,1,.25H24.73a1.34,1.34,0,0,1,1.34,1.34V24.41a1.34,1.34,0,0,1-1.34,1.34Z"
        className={styles.recipient}
      />
      <text transform="translate(12, 19)">$</text>
    </svg>
  )
  return type === "funder" ? funder : recipient
}
export default Chevron
