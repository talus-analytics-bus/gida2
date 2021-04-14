// 3rd party libs
import React from "react"
import { SourceText } from "../../../common"
import classNames from "classnames"

// utilities
import { getFlowTypeLabel } from "../../../misc/Util"

// styles
import styles from "./detailssection.module.scss"
import { ToggleFlowType } from "./ToggleFlowType"

const DetailsSection = ({
  header,
  content,
  text,
  curFlowType,
  setCurFlowType,
  flowTypeInfo,
  toggleFlowType,
  noFinancialData,
  noDataContent = null,
  // show data source text if true, hide otherwise
  showSource = true,
  classes = [],
}) => {
  /**
   * When radio button changes, set current flow type equal to its value.
   * @method onChange
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  const onChange = e => {
    const input = e.target.closest("label").querySelector("input")
    setCurFlowType(input.value)
  }

  const showCustomNoDataContent = noFinancialData && noDataContent !== null
  return (
    <div className={classNames(styles.detailsSection, ...classes)}>
      {header}
      {showCustomNoDataContent && noDataContent}
      {!showCustomNoDataContent && (
        <>
          {text && <div className={styles.text}>{text}</div>}
          {toggleFlowType && !noFinancialData && (
            <ToggleFlowType
              onChange={onChange}
              getFlowTypeLabel={getFlowTypeLabel}
              curFlowType={curFlowType}
              flowTypeInfo={flowTypeInfo}
            />
          )}
          {!noFinancialData && (
            <div className={styles.content}>
              {content}
              {showSource && <SourceText />}
            </div>
          )}
          {noFinancialData && (
            <span>No financial assistance data to show.</span>
          )}
        </>
      )}
    </div>
  )
}

export default DetailsSection
