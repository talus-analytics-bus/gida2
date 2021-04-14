import React, { useContext } from "react"
import classNames from "classnames"
import { Link } from "react-router-dom"
import styles from "./nav.module.scss"
import logoLight from "../../../assets/images/tracking.png"
import logoDark from "../../../assets/images/tracking-dark-mode.png"
import Menu from "./content/Menu/Menu.js"
import { Search } from "../../common"

// contexts
import OutbreakContext from "../../context/OutbreakContext"

const Nav = ({ page, ...props }) => {
  const logo = props.isDark ? logoDark : logoLight
  const [openMenu, setOpenMenu] = React.useState("")
  const toggleMenu = name => {
    setOpenMenu(openMenu !== name ? name : "")
  }

  // CONTEXT ACCESSORS
  const outbreaks = useContext(OutbreakContext)

  // CONSTANTS
  // define about menu links
  const aboutLinkData = [
    { pathname: "/about/background", label: "Background" },
    { pathname: "/about/data", label: "Data sources" },
    { pathname: "/about/citations", label: "Citations" },
    { pathname: "/about/submit", label: "Submit data" },
  ]

  return (
    <div
      className={classNames(
        styles.nav,
        "dark-bg-allowed",
        {
          [styles.loading]: props.loadingNav,
          [styles.dark]: props.isDark,
          [styles.wide]: page === "explore-map",
        },
        styles[page],
      )}
    >
      <div
        className={classNames(
          styles.content,
          { wide: page === "explore-map" },
          "pageContainer",
          "noPadding",
        )}
      >
        <Link to="/">
          <img src={logo} className={styles.logo} alt="GIDA - Tracker" />
        </Link>
        <div className={styles.links}>
          <Link
            className={
              page === "explore-map" || page === "details-country"
                ? styles.active
                : ""
            }
            to="/map"
          >
            Map
          </Link>
          <Link
            className={
              page === "funders-and-recipients" || page === "details"
                ? styles.active
                : ""
            }
            to="/funders-and-recipients"
          >
            Funders and recipients
          </Link>
          <div>
            <Link
              className={classNames({
                [styles.active]: page === "events" || page === "event",
              })}
              onClick={() => toggleMenu("events")}
            >
              PHEICs
              <span className={"caret"} />
            </Link>
            <Menu
              {...{
                name: "events",

                links: outbreaks.map(({ slug, name }) => (
                  <Link
                    className={classNames({
                      [styles.active]: curUrlPathnameContains(slug),
                    })}
                    to={"/events/" + slug}
                  >
                    {name}
                  </Link>
                )),
                openMenu,
                setOpenMenu,
                isDark: props.isDark,
              }}
            />
          </div>
          {
            // Analysis page commented out until more content is developed,
            // e.g., a Sankey diagram
            // <Link
            //   className={page === "analysis" ? styles.active : ""}
            //   to="/analysis"
            // >
            //   Analysis
            // </Link>
          }
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
                links: aboutLinkData.map(({ pathname, label }) => (
                  <Link
                    to={pathname}
                    className={classNames({
                      [styles.active]: curUrlPathnameContains(pathname),
                    })}
                  >
                    {label}
                  </Link>
                )),
                openMenu,
                setOpenMenu,
                isDark: props.isDark,
              }}
            />
          </div>
          <Search
            {...{
              isDark: props.isDark,
              name: "nav",
              expandedDefault: page !== "home",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Nav

/**
 * Return `true` if the current URL contains the text, and `false` otherwise.
 */
function curUrlPathnameContains(text) {
  const unknown =
    typeof window === "undefined" || typeof window.location === "undefined"
  if (!unknown) return window.location.pathname.includes(text)
  else return false
}
