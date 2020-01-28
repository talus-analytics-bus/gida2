import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import ReactTooltip from "react-tooltip";
import Menu from "./content/Menu/Menu.js";
import Search from "../../common/Search/Search.js";
import GhsaButton from "../../common/GhsaButton/GhsaButton.js";

const Nav = ({ page, ...props }) => {
  const logo = props.isDark ? logoDark : logoLight;
  const [openMenu, setOpenMenu] = React.useState("");
  const toggleMenu = name => {
    setOpenMenu(openMenu !== name ? name : "");
  };

  return (
    <div
      className={classNames(
        styles.nav,
        "dark-bg-allowed",
        { [styles.loading]: props.loadingNav },
        styles[page]
      )}
    >
      <div
        className={classNames(
          styles.content,
          { wide: page === "explore-map" },
          "pageContainer",
          "noPadding"
        )}
      >
        <Link to="/">
          <img src={logo} className={styles.logo} alt="GIDA - Tracker" />
        </Link>
        <div className={styles.links}>
          <GhsaButton {...{ active: page === "ghsa", isDark: props.isDark }} />
          <Link
            className={page === "explore-map" ? styles.active : ""}
            to="/explore/map"
          >
            Map
          </Link>
          <Link
            className={page === "explore-org" ? styles.active : ""}
            to="/explore/org"
          >
            Orgs
          </Link>
          <Link
            className={page === "analysis" ? styles.active : ""}
            to="/analysis"
          >
            Analysis
          </Link>
          <Link className={page === "data" ? styles.active : ""} to="/data">
            Data
          </Link>
          <div>
            <Link
              className={page === "about" ? styles.active : ""}
              onClick={() => toggleMenu("about")}
            >
              About
              <span className={"caret"} />
            </Link>
            <Menu
              {...{
                name: "about",
                links: [
                  <Link to="/about/background">Background</Link>,
                  <Link to="/about/data">Data sources</Link>,
                  <Link to="/about/research">Research</Link>,
                  <Link to="/about/submit">Submit data</Link>
                ],
                openMenu,
                setOpenMenu,
                isDark: props.isDark
              }}
            />
          </div>
          <Search {...{ isDark: props.isDark, name: "nav" }} />
        </div>
      </div>
    </div>
  );
};

export default Nav;
