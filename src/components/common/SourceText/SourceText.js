import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import moment from "moment";
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

export const Website = ({
  url,
  name,
  date_published,
  publication,
  ...props
}) => {
  return (
    <span>
      "<i>{name}</i>." {publication}.{" "}
      {moment(date_published).format("MMM D, YYYY")}.{" "}
      {
        <a href={url} target={"_blank"}>
          {url}
        </a>
      }
      .
    </span>
  );
};

export default SourceText;
