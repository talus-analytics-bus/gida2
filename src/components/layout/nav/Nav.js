import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import logoLight from "../../../assets/images/logo-light.png";
import logoDark from "../../../assets/images/logo-dark.png";
import ReactTooltip from "react-tooltip";
import Menu from "./content/Menu/Menu.js";
import Search from "../../common/Search/Search.js";

const Nav = props => {
  const page = props.page;
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
            <Link onClick={() => toggleMenu("explore")}>Explore</Link>
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
          <Link to="/analysis">Analysis</Link>
          <Link to="/data">Data</Link>
          <div>
            <Link onClick={() => toggleMenu("about")}>About</Link>
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
