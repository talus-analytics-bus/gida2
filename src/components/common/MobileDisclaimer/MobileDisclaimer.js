import React from "react"
import classNames from "classnames"

import styles from "./MobileDisclaimer.module.scss"

const MobileDisclaimer = props => {
  return (
    <div
      className={classNames(styles.mobile, {
        [styles.shiftDown]: props.page !== "index",
      })}
    >
      <div className={styles.disclaimer}>
        <p>
          Welcome to the International Disease and Events Analysis (IDEA) Global
          Health Security Tracking site, which maps the flow of funding and
          in-kind support for global health security.
        </p>
        <p>
          This website is currently designed for larger screens. Please return
          using a desktop browser, or maximize your browser window, and content
          will appear.
        </p>
      </div>
    </div>
  )
}

export default MobileDisclaimer
