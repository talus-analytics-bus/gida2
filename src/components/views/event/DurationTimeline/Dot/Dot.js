// 3rd party libs
import React from "react"

// styles and assets
import styles from "./dot.module.scss"

const Dot = ({ left, right }) => {
  return <div style={{ left, right }} className={styles.dot} />
}
export default Dot
