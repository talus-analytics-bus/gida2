import React from "react";
import classNames from "classnames";
import styles from "./filterdropdown.module.scss";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import Util from "../../misc/Util.js";

/**
 * @method FilterDropdown
 * Options should have value and label keys.
 */
const FilterDropdown = ({ label, options, onChange, className, ...props }) => {
  const nOptions = Util.comma(options.length);

  let value = [];

  if (props.curValues && props.curValues.length > 0) {
    if (typeof props.curValues[0] === "object") value = props.curValues;
    else value = options.filter(d => props.curValues.includes(d.value));
  }
  if (className) className.push(styles.label);

  // Define custom styles
  const customStyles = {
    option: (provided, state) => {
      return {
        ...provided,
        color: state.isSelected ? "#333 !important" : "inherit"
      };
    }
  };

  const updateBadges = value => {
    console.log("updateBadges");
    console.log("value");
    console.log(value);

    if (props.setBadges !== undefined) {
      // Manage badge array
      let newBadgeArr = [];
      let newBadgeArrValues = [];
      const curValuesList =
        typeof value === "object" ? value.map(d => d.value) : value;

      // Add existing badges
      if (props.badges.length > 0) {
        props.badges.forEach(d => {
          newBadgeArr.push(d);
          newBadgeArrValues.push(d.props.value);
        });
      }

      // Define badges to add to array
      const badgesToAdd = value.filter(
        d => !newBadgeArrValues.includes(d.value)
      );

      // Define badges to remove
      const badgesToRmv = newBadgeArrValues.filter(
        d => !curValuesList.includes(d)
      );

      if (badgesToAdd.length + badgesToRmv.length === 0) {
        return;
      } else {
        badgesToAdd.forEach(d => {
          newBadgeArr.push(
            <div value={d.value} className={styles.badge}>
              {d.value}
            </div>
          );
          newBadgeArrValues.push(d.value);
        });

        newBadgeArr = newBadgeArr.filter(d => {
          return !badgesToRmv.includes(d.props.value);
        });
        newBadgeArrValues = newBadgeArrValues.filter(d => {
          return !badgesToRmv.includes(d);
        });

        props.setBadges(newBadgeArr);
      }
    }
  };

  return (
    <div
      className={classNames(styles.filterDropdown, {
        [styles.up]: props.openDirection === "up",
        [styles.dark]: props.isDark
      })}
    >
      <div
        className={classNames(
          className !== undefined ? className : styles.label
        )}
      >
        {label}
      </div>
      <ReactMultiSelectCheckboxes
        styles={customStyles}
        placeholderButtonLabel={props.placeholder}
        options={options}
        onChange={v => {
          onChange(v);
          updateBadges(v);
        }}
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
