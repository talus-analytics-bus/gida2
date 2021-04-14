import React from "react"
import classNames from "classnames"
import styles from "./menu.module.scss"

const Menu = ({ name, links, openMenu, setOpenMenu, ...props }) => {
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
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    }
  })
  return (
    <div
      style={{ display: openMenu === name ? "flex" : "none" }}
      className={classNames(styles.menu, { [styles.dark]: props.isDark })}
    >
      <div
        id={"links-" + name}
        onClick={() => setOpenMenu("")}
        className={styles.links}
      >
        {links}
      </div>
    </div>
  )
}

export default Menu
