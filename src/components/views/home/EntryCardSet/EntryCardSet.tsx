import React, { FC, ReactElement } from "react"
import styles from "../EntryCard/entrycard.module.scss"

type ComponentProps = {
  children: ReactElement[]
}
export const EntryCardSet: FC<ComponentProps> = ({ children }) => {
  return <div className={styles.entryCardSet}>{children}</div>
}
