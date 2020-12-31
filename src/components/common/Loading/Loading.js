import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./loading.module.scss";

const Loading = ({ loaded, children, ...props }) => {
  return (
    <>
      {!loaded && <div className={styles.placeholder}>Loading...</div>}
      <div className={classNames(styles.content, { [styles.shown]: loaded })}>
        {children}
      </div>
    </>
  );
};
export default Loading;
