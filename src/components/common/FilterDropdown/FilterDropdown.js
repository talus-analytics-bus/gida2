import React from "react";
import styles from "./filterdropdown.module.scss";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import { core_capacities_grouped } from "../../misc/Data.js";
import Util from "../../misc/Util.js";

/**
 * @method FilterDropdown
 * Options should have value and label keys.
 */
const FilterDropdown = ({ label, options, onChange, ...props }) => {
  const nOptions = Util.comma(options.length);
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
        value={props.curValues}
      />
    </div>
  );
};

export default FilterDropdown;
