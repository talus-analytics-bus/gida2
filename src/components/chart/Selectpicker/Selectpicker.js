import React from "react"
import classNames from "classnames"
import styles from "./selectpicker.module.scss"
import Util from "../../misc/Util.js"

/**
 * Select picker that sets an option from a list.
 * Default is none.
 * @method Selectpicker
 */
const Selectpicker = ({
  setOption,
  optionList = [],
  optionGroups,
  allOption,
  label = "Label",
  curSelection = "test",
  wide = false,
}) => {
  const handleChange = e => {
    setOption(e.target.value)
  }
  const isGrouped = optionGroups !== undefined

  // FUNCTIONS //
  // return JSX for options, including optgroups if defined
  const getOptionJsx = () => {
    if (isGrouped) {
      const optionJsx = []
      for (const [k, v] of Object.entries(optionGroups)) {
        optionJsx.push(
          <optgroup label={k}>
            {v.map(d => (
              <option disabled={d.disabled} value={d.value}>
                {d.label}
              </option>
            ))}
          </optgroup>,
        )
      }
      return optionJsx
    } else {
      return optionList.map(d => (
        <option disabled={d.disabled} value={d.value}>
          {d.label}
        </option>
      ))
    }
  }
  const optionJsx = getOptionJsx()
  return (
    <div className={classNames(styles.selectpicker, { [styles.wide]: wide })}>
      <div className={styles.label}>{label}</div>
      <select value={curSelection} onChange={handleChange}>
        {allOption && <option value="all">{allOption}</option>}
        {optionJsx}
      </select>
    </div>
  )
}

export default Selectpicker
