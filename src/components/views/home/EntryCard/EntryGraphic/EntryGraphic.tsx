import React from "react"
import styles from "../entrycard.module.scss"
type EntryGraphicProps = {
  graphic: any
}
export const EntryGraphic = ({ graphic }: EntryGraphicProps) => {
  return <div className={styles.entryGraphic}>{graphic}</div>
}
