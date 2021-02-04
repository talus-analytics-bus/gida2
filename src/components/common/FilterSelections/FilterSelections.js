import React from "react";
import classNames from "classnames";
import styles from "./filterselections.module.scss";
import Util from "../../misc/Util.js";
import Button from "../../common/Button/Button.js";

/**
 * @method FilterSelections
 * Options should have value and label keys.
 */
const FilterSelections = ({
  selections,
  setSelections,
  optionList,
  type,
  ...props
}) => {
  const getBadgeCancelCallbackFunc = ({ valToRmv }) => {
    return () => {
      // get current values selected (new object)
      const curSelectedVals = [];
      selections.forEach(dd => {
        curSelectedVals.push(dd);
      });

      // filter out value to remove
      const updatedSelectedVals = curSelectedVals.filter(dd => {
        if (typeof dd === "object") {
          return dd.value !== valToRmv;
        } else return dd !== valToRmv;
      });

      setSelections(updatedSelectedVals);
    };
  };

  const options = selections.map(d => optionList.find(dd => dd.value === d));
  return (
    <div className={styles.filterSelections}>
      {options.map(d => (
        <div
          title={d.label}
          value={d.value}
          type={type}
          className={styles.badge}
        >
          {Util.getShortName(d.label)}
          <Button
            callback={getBadgeCancelCallbackFunc({
              type,
              valToRmv: d.value,
            })}
            type={"close-badge"}
          />
        </div>
      ))}
    </div>
  );
};

export default FilterSelections;
