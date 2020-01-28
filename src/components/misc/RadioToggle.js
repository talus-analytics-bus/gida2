import React from "react";
import classNames from "classnames";
import styles from "./radiotoggle.module.scss";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method RadioToggle
 */
const RadioToggle = ({
  choices,
  curVal,
  callback,
  onClick,
  label,
  className,
  ...props
}) => {
  /**
   * When radio button changes, set current choice equal to its value.
   * @method onChange
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  const onChange = e => {
    if (props.selectpicker) {
      console.log("e");
      console.log(e);
      callback(e.target.value);
    } else {
      const input = e.target.closest("label").querySelector("input");
      callback(input.value);
    }
  };

  if (onClick === undefined) onClick = (a, b) => b;

  if (props.selectpicker) {
    return (
      <div
        className={classNames(styles.radioToggle, {
          [styles.disabled]: props.disabled === true,
          [styles.horizontal]: props.horizontal === true
        })}
      >
        <div className={classNames(className !== undefined ? className : "")}>
          {label}
        </div>
        <select onChange={callback ? onChange : undefined}>
          {choices.map(c => (
            <option value={c.value}>{c.name}</option>
          ))}
        </select>
      </div>
    );
  } else
    return (
      <div
        className={classNames(styles.radioToggle, {
          [styles.disabled]: props.disabled === true,
          [styles.horizontal]: props.horizontal === true
        })}
      >
        <div className={classNames(className !== undefined ? className : "")}>
          {label}
        </div>
        <form>
          {choices.map(c => (
            <span>
              {onClick(
                c.value,
                <label
                  disabled={
                    props.disabled === true || c.disabled === true
                      ? "disabled"
                      : ""
                  }
                  onClick={callback ? onChange : undefined}
                  for={c.name}
                >
                  <input
                    disabled={
                      props.disabled === true || c.disabled === true
                        ? "disabled"
                        : ""
                    }
                    type="radio"
                    name={c.name}
                    value={c.value}
                    checked={curVal.toString() === c.value.toString()}
                  />
                  {c.name}
                </label>
              )}
            </span>
          ))}
        </form>
      </div>
    );
};

export default RadioToggle;
