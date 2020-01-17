import React from "react";
import styles from "./search.module.scss";
import NodeQuery from "../../misc/NodeQuery.js";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Search
 */
const Search = ({ ...props }) => {
  const [open, setOpen] = React.useState(props.openDefault || true);
  const [results, setResults] = React.useState([]);

  const handleInputChange = async e => {
    const val = e.target.value;
    // If no value, show region list.
    if (val === "") {
      setResults([]);
      return;
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
      props.setSearchResults(null);
    }
  };

  return (
    <div className={styles.search}>
      <div className={styles.searchBar}>
        <div className={styles.field}>
          <i className={"material-icons"}>search</i>
          <input
            id={"placeSearch"}
            type="text"
            placeholder="search for a country or organization"
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>
      <div className={styles.results}>
        {results.map(d => (
          <div className={styles.result}>{d.name}</div>
        ))}
      </div>
    </div>
  );
};

export default Search;
