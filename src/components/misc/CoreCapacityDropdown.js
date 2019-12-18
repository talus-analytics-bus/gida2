import React from "react";
import styles from "./corecapacitydropdown.module.scss";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import { core_capacities_grouped } from "./Data.js";

/**
 * @method CoreCapacityDropdown
 */
const CoreCapacityDropdown = ({ onChange, ...props }) => {
  return (
    <div className={styles.coreCapacityDropdown}>
      <div className={styles.label}>Core capacity</div>
      <ReactMultiSelectCheckboxes
        placeholderButtonLabel={"Select core capacities"}
        options={core_capacities_grouped}
        onChange={onChange}
      />
    </div>
  );
};

export default CoreCapacityDropdown;
