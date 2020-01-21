import React from "react";
import styles from "./filterdropdown.module.scss";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import Util from "../../misc/Util.js";

/**
 * @method FilterDropdown
 * Options should have value and label keys.
 */
const FilterDropdown = ({ label, options, onChange, ...props }) => {
  const nOptions = Util.comma(options.length);
  let value = [];
  if (props.curValues && props.curValues.length > 0) {
    if (typeof props.curValues[0] === "object") value = props.curValues;
    else value = options.filter(d => props.curValues.includes(d.value));
  }
  return (
    <div className={styles.filterDropdown}>
      <div className={styles.label}>{label}</div>
      <ReactMultiSelectCheckboxes
        placeholderButtonLabel={props.placeholder}
        options={options}
        onChange={onChange}
        getDropdownButtonLabel={({ placeholderButtonLabel, value }) => {
          if (value === undefined || value.length === 0)
            return `${placeholderButtonLabel} (all)`;
          else
            return `${placeholderButtonLabel} (${Util.comma(
              value.length
            )} of ${nOptions})`;
        }}
        value={value}
      />
    </div>
  );
};

export default FilterDropdown;
