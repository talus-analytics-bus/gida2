import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./loading.module.scss";
import spinnerImg from "../../../assets/images/spinner.svg";

const Loading = ({
  loaded,
  placeholderText = "Loading...",
  children,
  small = false,
  margin,
  ...props
}) => {
  return (
    <>
      {!loaded && (
        <div
          style={{ margin }}
          className={classNames(styles.placeholder, { [styles.small]: small })}
        >
          <div className={styles.imgContainer}>
            <img src={spinnerImg} />
          </div>
          {
            // <span>{placeholderText}</span>
          }
        </div>
      )}
      <div className={classNames(styles.content, { [styles.shown]: loaded })}>
        {children}
      </div>
    </>
  );
};
export default Loading;
