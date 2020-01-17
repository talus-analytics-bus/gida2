import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./search.module.scss";
import NodeQuery from "../../misc/NodeQuery.js";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Search
 */
const Search = ({ ...props }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState(null);

  const handleInputChange = async e => {
    const val = e.target.value;
    // If no value, show region list.
    if (val === "") {
      setResults(null);
    } else {
      // Find country or org matches
      // Return them by setting the country values
      const results = await NodeQuery({ search: val });
      setResults(results.slice(0, 5));
    }
  };

  const handleKeyPress = e => {
    if (e.keyCode === 27) {
      e.target.value = "";
      setResults(null);
    }
  };

  // Hide menus on root click
  document.getElementById("root").onclick = e => {
    setOpen(false);
  };

  const inputEl = (
    <input
      id={"placeSearch"}
      type="text"
      placeholder="search for a country or organization"
      onChange={handleInputChange}
      onKeyDown={handleKeyPress}
    />
  );

  return (
    <div onClick={() => setOpen(true)} className={styles.search}>
      <div
        className={classNames(styles.searchBar, {
          [styles.expanded]: expanded
        })}
      >
        <div className={styles.field}>
          <i
            onClick={() => setExpanded(!expanded)}
            className={"material-icons"}
          >
            search
          </i>
          {inputEl}
        </div>
      </div>
      {results !== null && (
        <div
          style={{ display: open ? "flex" : "none" }}
          className={styles.results}
        >
          {results.length > 0 &&
            results.map(d => (
              <Link
                onClick={() => {
                  document.getElementById("placeSearch").value = "";
                  setResults(null);
                }}
                to={`/details/${d.id}/funder`}
              >
                <div className={styles.result}>
                  <div className={styles.name}>{d.name}</div>
                  <div className={styles.type}>{d.type}</div>
                </div>
              </Link>
            ))}
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
