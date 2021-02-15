import React from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import styles from "./loading.module.scss"
import spinnerImg from "../../../assets/images/loading.gif"
// import spinnerImg from "../../../assets/images/spinner.svg";

const Loading = ({
  loaded = true,
  small = false,
  slideUp = false,
  align = "left", // or 'center'
  message = null, // text to show while loading
  children,

  // custom styles
  margin,
  top,
  right,
  position,
  minHeight,
  ...props
}) => {
  return (
    <>
      {!loaded && (
        <div
          style={{ margin, top, right, minHeight, position }}
          className={classNames(styles.placeholder, styles[align], {
            [styles.small]: small,
          })}
        >
          <div className={styles.imgContainer}>
            {message && <div className={styles.message}>{message}</div>}
            <img alt="Loading spinner" src={spinnerImg} />
          </div>
        </div>
      )}
      {children && (
        <div
          className={classNames(styles.content, {
            [styles.shown]: loaded,
            [styles.up]: loaded && slideUp,
            [styles.down]: !loaded && slideUp,
          })}
        >
          {children}
        </div>
      )}
    </>
  )
}
export default Loading
