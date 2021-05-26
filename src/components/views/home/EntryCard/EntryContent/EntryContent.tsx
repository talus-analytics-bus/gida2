import React from "react"
import styles from "../entrycard.module.scss"

type EntryContentProps = {
  title: string
  description: any
  actions: any[]
}
export const EntryContent = ({
  title,
  description,
  actions,
}: EntryContentProps) => {
  return (
    <div className={styles.entryContent}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>{actions}</div>
    </div>
  )
}
