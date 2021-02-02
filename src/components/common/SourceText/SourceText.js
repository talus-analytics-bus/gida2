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
      <Link className={styles.sourceText} to={linkTo}>
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
  notes,
  linksOnly = true,
  ...props
}) => {
  // CONSTANTS //
  const notesJsx = notes !== "" ? <> {notes}.</> : null;
  const dateJsx =
    date_published !== null ? (
      <> {moment(date_published).format("MMM D, YYYY")}. </>
    ) : null;
  if (linksOnly) {
    return (
      <a href={url} target={"_blank"}>
        {publication}
      </a>
    );
  } else
    return (
      <span>
        "<i>{name}</i>." {publication}. {dateJsx}
        {
          <a href={url} target={"_blank"}>
            {url}
          </a>
        }
        .{notesJsx}
      </span>
    );
};

export const WebsiteList = ({ websites, linksOnly }) => {
  if (linksOnly) {
    return websites.map((d, i) => {
      const comma = i !== websites.length - 1 ? ", " : null;
      return (
        <>
          <Website {...{ ...d, linksOnly }} />
          {comma}
        </>
      );
    });
  } else {
    return websites.map(d => (
      <ul className={styles.sourceTextList}>
        <li>
          <Website {...{ ...d, linksOnly }} />
        </li>
      </ul>
    ));
  }
};

export default SourceText;
