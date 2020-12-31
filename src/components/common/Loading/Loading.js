import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./loading.module.scss";
import spinnerImg from "../../../assets/images/spinner.svg";

const Loading = ({
  loaded,
  placeholderText = "Loading...",
  children,
  ...props
}) => {
  return (
    <>
      {!loaded && (
        <div className={styles.placeholder}>
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
