import React from "react"
import styles from "./checkbox.module.scss"
import classNames from "classnames"

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Checkbox
 */
const Checkbox = ({
  label,
  value,
  curChecked,
  callback,
  classes = [],
  ref,
  style = {},
  ...props
}) => {
  /**
   * When radio button changes, set current choice equal to its value.
   * @method onChange
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  const onChange = e => {
    const input = e.target.closest("label").querySelector("input")
    callback(input.value)
  }

  return (
    <div
      style={style}
      ref={ref}
      className={classNames(styles.checkbox, ...classes)}
    >
      <form>
        <label onClick={callback ? onChange : undefined} for={label}>
          <input
            type="checkbox"
            name={label}
            value={value}
            checked={curChecked === true}
          />
          <span>{label}</span>
        </label>
      </form>
    </div>
  )
}

export default Checkbox
