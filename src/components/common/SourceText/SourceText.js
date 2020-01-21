import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./sourcetext.module.scss";

const SourceText = ({
  label = "Data sources",
  linkTo = "/about/data",
  ...props
}) => {
  return (
    <Link className={classNames(styles.sourceText)} to={linkTo}>
      {label}
    </Link>
  );
};
export default SourceText;
