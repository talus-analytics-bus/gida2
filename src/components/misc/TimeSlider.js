import React from "react";
import classNames from "classnames";
import styles from "./timeslider.module.scss";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method TimeSlider
 */
const TimeSlider = ({
  minYearDefault,
  maxYearDefault,
  label,
  onAfterChange,
  hide,
  ...props
}) => {
  // Setup year slider components.
  // TODO make a component so we can reuse it.
  const Range = Slider.Range;
  const marks = {};
  for (let i = minYearDefault; i <= maxYearDefault; i++) {
    marks[i] = i;
  }

  return (
    <div
      className={classNames(styles.timeSlider, {
        [styles.disabled]: props.disabled
      })}
    >
      <div>{label || "Select time range"}</div>
      <div className={classNames({ [styles.left]: props.side === "left" })}>
        <div>
          <Range
            disabled={props.disabled}
            className={hide ? styles.hide : ""}
            min={minYearDefault}
            max={maxYearDefault}
            defaultValue={[minYearDefault, maxYearDefault]}
            marks={marks}
            step={1}
            onAfterChange={onAfterChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
