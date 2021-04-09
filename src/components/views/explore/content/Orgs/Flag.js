import React from "react"
import classNames from "classnames"
import styles from "./flag.module.scss"

export const FLAG_BASE_URL = "https://flags.talusanalytics.com/shiny_1000px/"
export const FLAG_BASE_URL_64 = "https://flags.talusanalytics.com/shiny_64px/"

export function Flag({
  filename = "unspecified.png",
  show,
  big = false,
  localFile = false,
  small = false,
}) {
  const baseUrl = big ? FLAG_BASE_URL : FLAG_BASE_URL_64
  if (!show) return null
  else {
    // https://medium.com/@webcore1/react-fallback-for-broken-images-strategy-a8dfa9c1be1e
    const addDefaultSrc = ev => {
      ev.target.src = "/flags/unspecified.png"
    }
    const flagSrc = localFile ? "/flags/" + filename : `${baseUrl}${filename}`
    const flag = (
      <div className={classNames(styles.flag, { [styles.big]: big })}>
        <img
          alt={"Flag of " + filename}
          key={filename}
          onError={e => addDefaultSrc(e)}
          className={classNames(styles.flagImg, { [styles.small]: small })}
          src={flagSrc}
        />
      </div>
    )
    return flag
  }
}
