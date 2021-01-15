import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./sourcetext.module.scss";

const SourceText = ({
  label = "Data sources",
  linkTo = "/about/data",
  children,
  ...props
}) => {
  const component =
    children === undefined ? (
      <Link className={classNames(styles.sourceText)} to={linkTo}>
        {label}
      </Link>
    ) : (
      <div className={styles.custom}>{children}</div>
    );
  return component;
};
export default SourceText;
