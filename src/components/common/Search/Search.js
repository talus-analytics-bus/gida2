import React, { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import styles from "./search.module.scss"
import { SearchResults } from "../../misc/Queries"
import Util from "../../misc/Util.js"

export const searchableSubcats = [
  "academia",
  // "agency",
  "country",
  "foundation",
  "international_organization",
  "multilateral",
  "ngo",
  "organization",
  "other",
  "other_public_sector",
  "overseas_department",
  "private_sector",
  "public_private_partnership",
  // "region",
  "state_/_department_/_territory",
  // "sub-organization",
  "world",
]
/**
 * Search bar displaying stakeholders and (optionally) PHEICs that match the
 * keywords entered.
 *
 * @param {Function} callback Function to be called after search finished
 * @param {string} name Unique name of search bar
 * @param {boolean} top True if search results should show on top, false if btm
 * @param {numeric} limit Max number of search results to display
 * @param {boolean} wide True if bar should occupy 100% of container width,
 *                       false if it should occupy only as much as needed
 * @param {boolean} includePheics True if PHEICs should be included in search
 *                                results, false if only stakeholders
 * @param  {...any} props Additional properties
 * @returns
 */
const Search = ({
  callback,
  name,
  top = false,
  limit = 5,
  wide = false,
  includePheics = true,
  ...props
}) => {
  // REFS //
  const resultsRef = useRef(null)

  // STATE //
  const [expanded, setExpanded] = useState(props.expandedDefault || false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState(null)
  const [allowAnimation, setAllowAnimation] = useState(false)

  const handleInputChange = async e => {
    const val = e.target.value
    // If no value, show region list.
    if (val === "") {
      setResults(null)
    } else {
      const results = await SearchResults({
        search: val,
        limit: limit || 5,
        includePheics,
        filters: {
          "Stakeholder.show": [true],
          "Stakeholder.subcat": [
            [
              "neq",
              [
                // "state_/_department_/_territory",
                "region",
                "agency",
                "sub-organization",
              ],
            ],
          ],
          "Stakeholder.slug": [["neq", ["not-reported"]]],
        },
      })
      setResults(results)
    }
  }

  const handleKeyPress = e => {
    if (e.keyCode === 27) {
      e.target.value = ""
      setResults(null)
    } else if (e.keyCode === 40) {
      e.preventDefault()
      // down
      // focus first result if any
      if (resultsRef.current !== null) {
        const firstResultEl = resultsRef.current.children[0]
        if (firstResultEl !== undefined) firstResultEl.focus()
      }
    } else if (e.keyCode === 13) {
      // enter
      // jump to first result's page if any
      if (resultsRef.current !== null) {
        const firstResultEl = resultsRef.current.children[0]
        if (firstResultEl !== undefined) firstResultEl.click()
      }
    }
  }

  const handleKeyPressResult = e => {
    if (e.keyCode === 40) {
      // down
      e.preventDefault()
      if (e.target.nextSibling !== null) e.target.nextSibling.focus()
    } else if (e.keyCode === 38) {
      // up
      e.preventDefault()
      if (e.target.previousSibling !== null) e.target.previousSibling.focus()
      else document.getElementById("placeSearch-" + name).focus()
    }
  }

  const unset = () => {
    document.getElementById("placeSearch-" + name).value = ""
    setResults(null)
  }

  const getResults = results => {
    if (callback === undefined) {
      return results.map(d => {
        const pheic = d.was_pheic !== undefined
        const defaultCat = pheic ? "PHEIC" : "Stakeholder"
        const url = pheic
          ? `/events/${d.slug}`
          : `/details/${d.id}/${d.primary_role}`
        d = { cat: defaultCat, ...d }
        let catTmp = d["cat"]
        if (catTmp.startsWith("ngo")) catTmp = "NGO"
        const cat = catTmp.replaceAll("_", " ").trim()
        return (
          <Link tabindex={0} onClick={unset} to={url}>
            <div className={styles.result}>
              <div className={styles.name}>{d.name}</div>
              <div className={styles.type}>
                {Util.getInitCap(cat)}
                {d.primary_role && <>, mainly {d.primary_role}</>}
              </div>
            </div>
          </Link>
        )
      })
    } else
      return results.map(d => (
        <div
          onClick={() => {
            unset()
            callback(d.id)
          }}
          className={styles.result}
        >
          <div className={styles.name}>{d.name}</div>
          <div className={styles.type}>{d.type}</div>
        </div>
      ))
  }

  // Hide menus on root click
  document.getElementById("root").onclick = e => {
    setShowResults(false)
  }

  const inputEl = (
    <input
      autoComplete={"chrome-off"}
      className={"dark-bg-allowed"}
      id={"placeSearch-" + name}
      type="text"
      placeholder={getPlaceholderText({ includePheics })}
      onChange={handleInputChange}
      onKeyDown={handleKeyPress}
    />
  )

  useEffect(() => {
    // toggle expand/collapse if default value is changed
    setExpanded(props.expandedDefault)
  }, [props.expandedDefault])

  // JSX //
  return (
    <div
      onClick={() => setShowResults(true)}
      className={classNames(styles.search, {
        [styles.top]: top,
        [styles.wide]: wide,
        [styles.allowAnimation]: allowAnimation,
      })}
    >
      <div
        className={classNames(styles.searchBar, {
          [styles.expanded]: expanded,
          [styles.expandedByDefault]: props.expandedDefault === true,
          [styles.dark]: props.isDark,
        })}
      >
        <div className={styles.field}>
          <i
            onClick={e => {
              // If search bar results are showing when it's minimized, then
              // hide the results.
              if (expanded) {
                e.stopPropagation()
                setShowResults(false)
              }
              if (props.expandedDefault !== true) {
                setAllowAnimation(true)
                setExpanded(!expanded)
                setTimeout(() => {
                  setAllowAnimation(false)
                }, 500)
              }
            }}
            className={"material-icons"}
          >
            search
          </i>
          {inputEl}
        </div>
      </div>
      {results !== null && (
        <div
          ref={resultsRef}
          onKeyDown={handleKeyPressResult}
          style={{ display: showResults ? "flex" : "none" }}
          className={classNames(styles.results, {
            [styles.dark]: props.isDark,
          })}
        >
          {results.length > 0 && getResults(results)}
          {results.length === 0 && (
            <div className={classNames(styles.result, styles.noResult)}>
              <i>No results</i>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search

/**
 * Return placeholder text based on which entities will be searched for.
 */
const getPlaceholderText = ({ includePheics }) => {
  if (includePheics) {
    return "search for a country, org, or PHEIC"
  } else return "search for a country or organization"
}
