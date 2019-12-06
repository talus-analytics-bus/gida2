import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import logo from "../../../assets/images/logo-light.png";
import ReactTooltip from "react-tooltip";

const Nav = props => {
  const page = props.page;

  return (
    <div
      className={classNames(
        styles.nav,
        { [styles.loading]: props.loadingNav },
        styles[page]
      )}
    >
      <div className={classNames(styles.content, "pageContainer", "noPadding")}>
        <img src={logo} alt="GIDA - Tracker" />
      </div>
    </div>
  );
};

export default Nav;
