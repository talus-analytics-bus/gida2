import React from "react"
import { EntryContent } from "./EntryContent/EntryContent"
import { EntryGraphic } from "./EntryGraphic/EntryGraphic"

// assets
import styles from "./entrycard.module.scss"
import classNames from "classnames"

// types
type EntryCardProps = {
  graphic: any
  title: string
  description: any
  actions: any[]
  className: string | undefined
}

/**
 * Display entry card as entry point into site feature. Includes a graphic and
 * some text along with one or more actions.
 */
export const EntryCard = ({
  graphic,
  title,
  description,
  actions,
  className,
}: EntryCardProps) => {
  return (
    <div className={classNames(styles.entryCard, className)}>
      <EntryGraphic {...{ graphic }} />
      <EntryContent
        {...{
          title,
          description,
          actions,
        }}
      />
    </div>
  )
}
