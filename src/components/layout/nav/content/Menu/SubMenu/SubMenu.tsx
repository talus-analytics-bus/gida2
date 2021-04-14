import React, { useState } from "react"
import Menu from "../Menu"

// assets and styles
import styles from "./submenu.module.scss"

type SubMenuProps = {
  children: any
  name: string
  label: string
  isDark: boolean
}

/**
 * Creates a submenu within a `<Menu />` allowing additional options to open
 * to the right of the menu.
 */
export const SubMenu = ({
  children,
  name,
  label,
  isDark = false,
}: SubMenuProps) => {
  // STATE
  const [openMenu, setOpenMenu] = useState<string>("")

  // FUNCTIONS
  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu !== name ? name : "")
  }

  // JSX
  return (
    <section className={styles.subMenu}>
      <div
        onClick={e => {
          e.stopPropagation()
          toggleMenu(name)
        }}
      >
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
