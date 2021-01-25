import React from "react";
import classNames from "classnames";
import styles from "./selectpicker.module.scss";
import Util from "../../misc/Util.js";

/**
 * Select picker that sets an option from a list.
 * Default is none.
 * @method Selectpicker
 */
const Selectpicker = ({
  setOption = () => "",
  optionList = [],
  allOption,
  label = "Label",
  curSelection = "test",
  ...props
}) => {
  const handleChange = e => {
    setOption(e.target.value);
  };
  return (
    <div className={styles.selectpicker}>
      <div className={styles.label}>{label}</div>
      <select value={curSelection} onChange={handleChange}>
        {allOption && <option value="all">{allOption}</option>}
        {optionList.map(d => (
          <option value={d.value}>{d.label}</option>
        ))}
      </select>
    </div>
  );
};

export default Selectpicker;
