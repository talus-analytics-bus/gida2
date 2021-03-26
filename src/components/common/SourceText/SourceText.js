import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import styles from "./sourcetext.module.scss";
import classNames from "classnames";

const SourceText = ({
  label = "Data sources",
  linkTo = "/about/data",
  children,
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

const Website = ({
  url,
  name,
  date_published,
  publication,
  notes,
  linksOnly = true,
}) => {
  // CONSTANTS //
  const notesJsx = notes !== "" ? <>. {notes} </> : null;
  const dateJsx =
    date_published !== null ? (
      <> {moment(date_published).format("MMM D, YYYY")}. </>
    ) : null;
  if (linksOnly) {
    return (
      <>
        <a className={styles.url} href={url} target={"_blank"}>
          {publication}
        </a>
        <>{notesJsx}</>
      </>
    );
  } else
    return (
      <span>
        "<i>{name}</i>." {publication}. {dateJsx}
        {
          <a className={styles.url} href={url} target={"_blank"}>
            {url}
          </a>
        }
        {notesJsx}
      </span>
    );
};

export const WebsiteList = ({ websites, linksOnly }) => {
  const limit = 2;
  const withinLimit = websites.length <= limit;
  const [showAll, setShowAll] = useState(withinLimit);
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
    if (websites.length === 1)
      return (
        <>
          {": "}
          <Website {...{ ...websites[0], linksOnly }} />
        </>
      );
    else
      return (
        <>
          {websites
            .map(d => (
              <ul className={styles.sourceTextList}>
                <li>
                  <Website {...{ ...d, linksOnly }} />
                </li>
              </ul>
            ))
            .slice(0, showAll ? websites.length : limit)}
          {!withinLimit && (
            <span
              className={styles.showAll}
              onClick={() => setShowAll(!showAll)}
            >
              View {showAll ? "fewer" : "all " + websites.length} sources
              <span
                className={classNames("caret", { [styles.flipped]: showAll })}
              />{" "}
            </span>
          )}
        </>
      );
  }
};
SourceText.Website = Website;
export default SourceText;
