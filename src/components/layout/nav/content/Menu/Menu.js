import React from "react"
import classNames from "classnames"
import styles from "./menu.module.scss"
import PerfectScrollbar from "react-perfect-scrollbar"
import "react-perfect-scrollbar/dist/css/styles.css"
/**
 * Create a nav bar menu.
 */
const Menu = ({
  name,
  links,
  openMenu,
  setOpenMenu,
  isDark,
  inSubMenu = false,
}) => {
  // Close nav menus if user clicks anywhere outside them.
  const handleClickOutside = e => {
    if (name !== openMenu) return
    e.stopPropagation()
    const navEl = document.getElementById("links-" + name)
    if (navEl && !navEl.contains(e.target)) {
      setOpenMenu("")
    }
  }

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("mouseup", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mouseup", handleClickOutside)
    }
  })

  const Wrapper = inSubMenu ? PerfectScrollbar : React.Fragment
  return (
    <div
      style={{ display: openMenu === name ? "flex" : "none" }}
      className={classNames(styles.menu, {
        [styles.inSubMenu]: inSubMenu,
        [styles.dark]: isDark,
      })}
    >
      <Wrapper>
        <div
          id={"links-" + name}
          onClick={() => setOpenMenu("")}
          className={styles.links}
        >
          {links}
        </div>
      </Wrapper>
    </div>
  )
}

export default Menu
