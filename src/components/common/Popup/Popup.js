import React from "react";
import classNames from "classnames";
import styles from "./popup.module.scss";

// common
import { FunderIcon, RecipientIcon } from "../../misc/EntityRoleToggle";

// assets
import caseSvg from "./svg/cases.svg";
import deathSvg from "./svg/deaths.svg";
import calendarSvg from "./svg/calendar.svg";

/**
 * @method Popup
 */
const Popup = ({
  body,
  header = [{ title: "Germany", label: "funder" }],
  popupStyle,
  style,
  align = "center",
}) => {
  // JSX //
  if (body === null) return null;
  else
    return (
      <div
        style={popupStyle}
        className={classNames(styles.popup, styles[align])}
      >
        <Header {...{ header, style }} />
        <Body {...{ data: body, style }} />
      </div>
    );
};

// return correct icon component given the label
const getIcon = label => {
  const isRole = ["funder", "recipient"].includes(label);
  const isMaterial = false; // TODO
  const labelToSvg = {
    cases: caseSvg,
    deaths: deathSvg,
    calendar: calendarSvg,
  };
  const isSvg = Object.keys(labelToSvg).includes(label);

  if (isMaterial) {
    return <i className={"material-icons"}>{label}</i>;
  } else if (isRole) {
    return label === "funder" ? <FunderIcon /> : <RecipientIcon />;
  } else if (isSvg) {
    return <img src={labelToSvg[label]} />;
  } else {
    return null;
  }
};

const Header = ({ header, style }) => {
  const headerRows = [];
  header.forEach(({ title, label }) => {
    const isRole = ["funder", "recipient"].includes(label);
    const icon = getIcon(label, isRole);
    headerRows.push(
      <div style={style} className={styles.header}>
        <div
          className={classNames(styles.label, styles[label], {
            [styles.isRole]: isRole,
          })}
        >
          {icon || label}
        </div>
        <div className={styles.title}>{title}</div>
      </div>
    );
  });

  return headerRows;
};

const Body = ({ data, style }) => {
  const isArr = data.map !== undefined;
  return (
    <div style={style} className={styles.body}>
      {!isArr && data}
      {isArr &&
        data.map(d => (
          <>
            <div className={styles.label}>{d.field}</div>
            <div className={styles.value}>{d.value}</div>
          </>
        ))}
    </div>
  );
};

export default Popup;
