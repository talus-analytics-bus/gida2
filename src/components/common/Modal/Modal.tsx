import React, { useState } from "react"
import styles from "./modal.module.scss"
// import classNames from "classnames"

type ModalProps = {
  showPopup: boolean
  setShowPopup: Function
}
/**
 * Display modal, darkening background, which is dismissed by clicking on the
 * shadow (or on a close button in the modal if it exists).
 */
export const Modal = ({ showPopup, setShowPopup }: ModalProps): JSX.Element => {
  // FUNCTIONS
  function closePopup(e: React.MouseEvent) {
    if (showPopup) {
      setShowPopup(false)
    }
    e.stopPropagation()
  }
  return (
    <div className={styles.modal}>
      <div className={styles.shadow} onClick={closePopup} />
      <section>Modal content</section>
    </div>
  )
}
export default Modal
