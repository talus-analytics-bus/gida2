import React from "react"
import classNames from "classnames"
import styles from "./flag.module.scss"

export function Flag({ filename = "unspecified.png", show }) {
  if (!show) return null
  else {
    // https://medium.com/@webcore1/react-fallback-for-broken-images-strategy-a8dfa9c1be1e
    const addDefaultSrc = ev => {
      ev.target.src = "/flags/unspecified.png"
    }
    const flagSrc = `https://flags.talusanalytics.com/1000px/${filename}`
    const flag = (
      <img
        alt={"Flag of " + filename}
        key={filename}
        onError={e => addDefaultSrc(e)}
        className={classNames(styles.flag, { [styles.small]: false })}
        src={flagSrc}
      />
    )
    return flag
  }
}
