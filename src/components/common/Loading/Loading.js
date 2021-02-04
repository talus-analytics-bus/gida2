import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./loading.module.scss";
import spinnerImg from "../../../assets/images/loading.gif";
// import spinnerImg from "../../../assets/images/spinner.svg";

const Loading = ({
  loaded = true,
  small = false,
  slideUp = false,
  align = "left", // or 'center'
  message = null,
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
            {message && <i>{message}</i>}
            <img src={spinnerImg} />
          </div>
        </div>
      )}
      <div
        className={classNames(styles.content, {
          [styles.shown]: loaded,
          [styles.up]: loaded && slideUp,
          [styles.down]: !loaded && slideUp,
        })}
      >
        {children}
      </div>
    </>
  );
};
export default Loading;
