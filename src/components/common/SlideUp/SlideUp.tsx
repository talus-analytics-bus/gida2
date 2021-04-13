import React, { useState, useEffect } from "react"
import classNames from "classnames"
import styles from "./slideup.module.scss"

type SlideUpProps = {
  children: any
  delayFactor: number
}
const SlideUp = ({ children, delayFactor = 1 }: SlideUpProps) => {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    // slide and fade in children
    setTimeout(() => {
      setRevealed(true)
    }, 10 * delayFactor)
  }, [])

  return (
    <div
      className={classNames(styles.slideUp, {
        [styles.up]: revealed,
        [styles.down]: !revealed,
      })}
    >
      {children}
    </div>
  )
}
export default SlideUp
