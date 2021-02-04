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
  ...props
}) => {
  // CONSTANTS //

  // JSX //
  return (
    <div className={styles.popup}>
      <Header {...{ ...header }} />
      <Body {...{ data: body }} />
    </div>
  );
};

const Header = ({ label, title }) => {
  const isRole = ["funder", "recipient"].includes(label);
  const roleIcon = isRole ? (
    label === "funder" ? (
      <FunderIcon />
    ) : (
      <RecipientIcon />
    )
  ) : null;
  const caseIcon = label === "cases" ? caseSvg : null;
  const deathIcon = label === "deaths" ? deathSvg : null;
  const icon = roleIcon || caseIcon || deathIcon;
  return (
    <div className={styles.header}>
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

const Body = ({ data }) => {
  return (
    <div className={styles.body}>
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