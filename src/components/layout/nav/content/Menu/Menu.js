import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./menu.module.scss";

const Menu = ({ name, links, openMenu, setOpenMenu, ...props }) => {
  return (
    <div
      style={{ display: openMenu === name ? "flex" : "none" }}
      className={styles.menu}
    >
      <div onClick={() => setOpenMenu("")} className={styles.links}>
        {links}
      </div>
    </div>
  );
};

export default Menu;
