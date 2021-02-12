import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./search.module.scss";
import { Stakeholder } from "../../misc/Queries";
import Util from "../../misc/Util.js";

export const searchableSubcats = [
  "country",
  "government",
  "organization",
  // "region",
  "state_/_department_/_territory",
  "overseas_department",
  // "agency",
  "ngo",
  "other",
  // "sub-organization",
];
/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Search
 */
const Search = ({ callback, name, top = false, limit = 5, ...props }) => {
  // REFS //
  const resultsRef = useRef(null);

  // STATE //
  const [expanded, setExpanded] = useState(props.expandedDefault || false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const handleInputChange = async e => {
    const val = e.target.value;
    // If no value, show region list.
    if (val === "") {
      setResults(null);
    } else {
      // Find country or org matches
      // Return them by setting the country values

      const results = await Stakeholder({
        search: val,
        limit: limit || 5,
        filters: {
          "Stakeholder.subcat": [
            [
              "neq",
              [
                "state_/_department_/_territory",
                "region",
                "agency",
                "sub-organization",
              ],
            ],
          ],
          "Stakeholder.slug": [["neq", ["not-reported"]]],
        },
      });
      setResults(results);
    }
  };

  const handleKeyPress = e => {
    if (e.keyCode === 27) {
      e.target.value = "";
      setResults(null);
    } else if (e.keyCode === 40) {
      e.preventDefault();
      // down
      // focus first result if any
      if (resultsRef.current !== null) {
        const firstResultEl = resultsRef.current.children[0];
        if (firstResultEl !== undefined) firstResultEl.focus();
      }
    } else if (e.keyCode === 13) {
      // enter
      // jump to first result's page if any
      if (resultsRef.current !== null) {
        const firstResultEl = resultsRef.current.children[0];
        if (firstResultEl !== undefined) firstResultEl.click();
      }
    }
  };

  const handleKeyPressResult = e => {
    if (e.keyCode === 40) {
      // down
      e.preventDefault();
      if (e.target.nextSibling !== null) e.target.nextSibling.focus();
    } else if (e.keyCode === 38) {
      // up
      e.preventDefault();
      if (e.target.previousSibling !== null) e.target.previousSibling.focus();
      else document.getElementById("placeSearch-" + name).focus();
    }
  };

  const unset = () => {
    document.getElementById("placeSearch-" + name).value = "";
    setResults(null);
  };

  const getResults = results => {
    if (callback === undefined) {
      return results.map(d => {
        d = { cat: "Stakeholder", ...d };
        let catTmp = d["cat"];
        if (catTmp.startsWith("ngo")) catTmp = "NGO";
        const cat = catTmp.replaceAll("_", " ").trim();
        return (
          <Link onClick={unset} to={`/details/${d.id}/${d.primary_role}`}>
            <div className={styles.result}>
              <div className={styles.name}>{d.name}</div>
              <div className={styles.type}>
                {Util.getInitCap(cat)}, mainly {d.primary_role}
              </div>
            </div>
          </Link>
        );
      });
    } else
      return results.map(d => (
        <div
          onClick={() => {
            unset();
            callback(d.id);
          }}
          className={styles.result}
        >
          <div className={styles.name}>{d.name}</div>
          <div className={styles.type}>{d.type}</div>
        </div>
      ));
  };

  // Hide menus on root click
  document.getElementById("root").onclick = e => {
    setShowResults(false);
  };

  const inputEl = (
    <input
      autoComplete={"chrome-off"}
      className={"dark-bg-allowed"}
      id={"placeSearch-" + name}
      type="text"
      placeholder="search for a country or organization"
      onChange={handleInputChange}
      onKeyDown={handleKeyPress}
    />
  );

  // JSX //
  return (
    <div
      onClick={() => setShowResults(true)}
      className={classNames(styles.search, { [styles.top]: top })}
    >
      <div
        className={classNames(styles.searchBar, {
          [styles.expanded]: expanded,
          [styles.dark]: props.isDark,
        })}
      >
        <div className={styles.field}>
          <i
            onClick={e => {
              // If search bar results are showing when it's minimized, then
              // hide the results.
              if (expanded) {
                e.stopPropagation();
                setShowResults(false);
              }
              if (props.expandedDefault !== true) setExpanded(!expanded);
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
  );
};

export default Search;
