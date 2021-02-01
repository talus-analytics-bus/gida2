import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./search.module.scss";
import { Stakeholder } from "../../misc/Queries";
import Util from "../../misc/Util.js";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Search
 */
const Search = ({ callback, name, ...props }) => {
  const [expanded, setExpanded] = React.useState(
    props.expandedDefault || false
  );
  const [showResults, setShowResults] = React.useState(false);
  const [results, setResults] = React.useState(null);

  const handleInputChange = async e => {
    const val = e.target.value;
    // If no value, show region list.
    if (val === "") {
      setResults(null);
    } else {
      // Find country or org matches
      // Return them by setting the country values
      const searchableSubcats = [
        "country",
        "government",
        "organization",
        // "region",
        "state_/_department_/_territory",
        "agency",
        "other",
        "sub-organization",
      ];
      const results = await Stakeholder({
        search: val,
        limit: 5,
        filters: { "Stakeholder.subcat": searchableSubcats },
      });
      setResults(results);
    }
  };

  const handleKeyPress = e => {
    if (e.keyCode === 27) {
      e.target.value = "";
      setResults(null);
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
      autocomplete={"off"}
      className={"dark-bg-allowed"}
      id={"placeSearch-" + name}
      type="text"
      placeholder="search for a country or organization"
      onChange={handleInputChange}
      onKeyDown={handleKeyPress}
    />
  );

  return (
    <div onClick={() => setShowResults(true)} className={styles.search}>
      <div
        className={classNames(styles.searchBar, {
          [styles.expanded]: expanded,
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
