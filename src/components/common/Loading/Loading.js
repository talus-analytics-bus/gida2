import React from "react"
import classNames from "classnames"
import styles from "./loading.module.scss"
import spinnerImg from "../../../assets/images/loading.gif"

const Loading = ({
  loaded = true,
  small = false,
  tiny = false,
  slideUp = false,
  align = "left", // or 'center'
  message = null,
  children,

  // custom styles
  margin = undefined,
  top = undefined,
  messageTop = undefined,
  right = undefined,
  position = undefined,
  minHeight = undefined,
  ...props
}) => {
  return (
    <>
      {!loaded && (
        <div
          style={{ margin, top, right, minHeight, position }}
          className={classNames(styles.placeholder, styles[align], {
            [styles.small]: small,
            [styles.tiny]: tiny,
          })}
        >
          <div
            style={{ top: messageTop, position: "relative" }}
            className={styles.imgContainer}
          >
            {message && <i>{message}</i>}
            <img src={spinnerImg} />
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
