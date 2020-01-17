import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import ReactTooltip from "react-tooltip";

const Nav = props => {
  const page = props.page;
  const logo = props.isDark ? logoDark : logoLight;
  return (
    <div
      className={classNames(
        styles.nav,
        "dark-bg-allowed",
        { [styles.loading]: props.loadingNav },
        styles[page]
      )}
    >
      <div className={classNames(styles.content, "pageContainer", "noPadding")}>
        <Link to="/">
          <img src={logo} alt="GIDA - Tracker" />
        </Link>
        <div className={styles.links}>
          <Link to="/explore/map">Map</Link>
          <Link to="/explore/org">Organizations</Link>
          <Link to="/analysis">Analysis</Link>
          <Link to="/data">Data</Link>
          <Link to="/about/background">Background</Link>
          <Link to="/about/data">Data sources</Link>
          <Link to="/about/research">Research</Link>
          <Link to="/about/submit">Submit data</Link>
        </div>
      </div>
    </div>
  );
};

export default Nav;
