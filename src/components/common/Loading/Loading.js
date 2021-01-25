import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./loading.module.scss";
import spinnerImg from "../../../assets/images/spinner.svg";

const Loading = ({
  loaded = true,
  small = false,
  slideUp = false,
  children,

  // custom styles
  margin,
  top,
  position,
  minHeight,
  ...props
}) => {
  return (
    <>
      {!loaded && (
        <div
          style={{ margin, top, minHeight, position }}
          className={classNames(styles.placeholder, { [styles.small]: small })}
        >
          <div className={styles.imgContainer}>
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
