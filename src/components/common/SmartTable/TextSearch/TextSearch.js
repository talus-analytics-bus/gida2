// standard packages
import React, { useState, useEffect, useRef } from "react";

// assets and styles
import styles from "./textsearch.module.scss";

/**
 * @method TextSearch
 * Handle custom text search for `SmartTable` component
 */
export const TextSearch = ({
  onChangeFunc,
  searchText,
  placeholder = "search for...",
}) => {
  const [curTimeout, setCurTimeout] = useState(null);
  let searchRef = useRef(null);

  useEffect(() => {
    if (searchText === null) {
      searchRef.current.value = "";
    } else searchRef.current.value = searchText;
  }, [searchText]);
  return (
    <div className={styles.search}>
      <input
        onChange={e => {
          clearTimeout(curTimeout);
          const v = e.target.value !== "" ? e.target.value : null;
          const newTimeout = setTimeout(() => {
            if (onChangeFunc !== undefined) onChangeFunc(v);
          }, 500);
          setCurTimeout(newTimeout);
        }}
        type="text"
        placeholder={placeholder}
        ref={searchRef}
      />
      {/* {<i className={"material-icons"}>search</i>} */}
    </div>
  );
};

export default TextSearch;
