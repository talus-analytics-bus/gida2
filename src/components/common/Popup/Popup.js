import React from "react";
import classNames from "classnames";
import styles from "./popup.module.scss";

// common
import { FunderIcon, RecipientIcon } from "../../misc/EntityRoleToggle";

// assets
import caseSvg from "./svg/cases.svg";
import deathSvg from "./svg/deaths.svg";

/**
 * @method Popup
 */
const Popup = ({
  body,
  header = { title: "Germany", label: "funder" },
  popupStyle,
  style,
}) => {
  // JSX //
  return (
    <div style={popupStyle} className={styles.popup}>
      <Header {...{ ...header, style }} />
      <Body {...{ data: body, style }} />
    </div>
  );
};

const Header = ({ label, title, style }) => {
  const isRole = ["funder", "recipient"].includes(label);
  const roleIcon = isRole ? (
    label === "funder" ? (
      <FunderIcon />
    ) : (
      <RecipientIcon />
    )
  ) : null;
  const caseIcon = label === "cases" ? <img src={caseSvg} /> : null;
  const deathIcon = label === "deaths" ? <img src={deathSvg} /> : null;
  const icon = roleIcon || caseIcon || deathIcon;
  return (
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
};

const Body = ({ data, style }) => {
  return (
    <div style={style} className={styles.body}>
      {data.map(d => (
        <>
          <div className={styles.label}>{d.field}</div>
          <div className={styles.value}>{d.value}</div>
        </>
      ))}
    </div>
  );
};

export default Popup;
