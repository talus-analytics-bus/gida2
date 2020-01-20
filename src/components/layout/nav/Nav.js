import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import ReactTooltip from "react-tooltip";
import Menu from "./content/Menu/Menu.js";
import Search from "../../common/Search/Search.js";

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
      <div className={classNames(styles.content, "pageContainer", "noPadding")}>
        <Link to="/">
          <img src={logo} alt="GIDA - Tracker" />
        </Link>
        <div className={styles.links}>
          <div>
            <Link
              className={page === "explore" ? styles.active : ""}
              onClick={() => toggleMenu("explore")}
            >
              Explore
              <span className={"caret"} />
            </Link>
            <Menu
              {...{
                name: "explore",
                links: [
                  <Link to="/explore/map">Map</Link>,
                  <Link to="/explore/org">Organizations</Link>
                ],
                openMenu,
                setOpenMenu
              }}
            />
          </div>
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
                setOpenMenu
              }}
            />
          </div>
          <Search />
        </div>
      </div>
    </div>
  );
};

export default Nav;
