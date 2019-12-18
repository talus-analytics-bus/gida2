import React from "react";
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
  ...props
}) => {
  /**
   * When radio button changes, set current choice equal to its value.
   * @method onChange
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  const onChange = e => {
    const input = e.target.closest("label").querySelector("input");
    callback(input.value);
  };

  if (onClick === undefined) onClick = (a, b) => b;

  return (
    <div className={styles.radioToggle}>
      <div>{label}</div>
      <form>
        {choices.map(c => (
          <span>
            {onClick(
              c.value,
              <label onClick={callback ? onChange : undefined} for={c.name}>
                <input
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
