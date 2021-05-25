import classNames from "classnames"
import React from "react"
import Menu from "../Menu"

// assets and styles
import styles from "./submenu.module.scss"

type SubMenuProps = {
  children: any
  name: string
  label: string
  openMenu: string
  setOpenMenu: Function
  isDark: boolean
  active: boolean
}

/**
 * Creates a submenu within a `<Menu />` allowing additional options to open
 * to the right of the menu.
 */
export const SubMenu = ({
  children,
  name,
  label,
  openMenu,
  setOpenMenu,
  isDark = false,
  active = false,
}: SubMenuProps) => {
  // FUNCTIONS
  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu !== name ? name : "")
  }

  const onMouseEnterOrLeave = (e: any) => {
    e.stopPropagation()
    toggleMenu(name)
  }

  const handleMoveOutside = (e: any) => {
    if (name !== openMenu) return
    e.stopPropagation()
    const navEl = document.getElementById("links-" + name)
    const menuEl = document.getElementById("submenu-" + name)
    const notInLinks = navEl && !navEl.contains(e.target)
    const notInMenu = menuEl && !menuEl.contains(e.target)
    if (notInLinks && notInMenu) {
      setOpenMenu("")
    }
  }

  // JSX
  return (
    <section
      id={"submenu-" + name}
      className={classNames(styles.subMenu, { [styles.active]: active })}
    >
      <div onMouseEnter={onMouseEnterOrLeave} onMouseLeave={handleMoveOutside}>
        <span>{label}</span>
        <i className="material-icons">chevron_right</i>
      </div>
      <Menu
        {...{
          name,
          links: children,
          inSubMenu: true,
          openMenu,
          setOpenMenu,
          isDark,
        }}
      />
    </section>
  )
}
