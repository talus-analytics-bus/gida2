// 3rd party libs
import React from "react";
import {SourceText} from "../../../common";
import classNames from "classnames";

// styles
import styles from "./detailssection.module.scss";

// FC for DetailsSection.
const DetailsSection = ({
  header,
  content,
  text,
  curFlowType,
  setCurFlowType,
  flowTypeInfo,
  toggleFlowType,
  noFinancialData,
  // show data source text if true, hide otherwise
  showSource = true,
  classes = [],
  ...props
}) => {
  /**
   * When radio button changes, set current flow type equal to its value.
   * @method onChange
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  const onChange = e => {
    const input = e.target.closest("label").querySelector("input");
    setCurFlowType(input.value);
  };

  const getFlowTypeLabel = (flowType, flowTypeInfo) => {
    if (!flowTypeInfo) return "";
    const match = flowTypeInfo.find(d => d.name === flowType);
    if (match) return match.display_name;
    return "";
  };
  return (
    <div className={classNames(styles.detailsSection, ...classes)}>
      {header}
      {text && <div className={styles.text}>{text}</div>}
      {toggleFlowType && !noFinancialData && (
        <form>
          {["disbursed_funds", "committed_funds"].map(flowType => (
            <label onClick={onChange} for={flowType}>
              <input
                type="radio"
                name="radio"
                value={flowType}
                checked={curFlowType === flowType}
              />
              <span>{getFlowTypeLabel(flowType, flowTypeInfo)}</span>
            </label>
          ))}
        </form>
      )}
      {!noFinancialData && (
        <div className={styles.content}>
          {content}
          {showSource && <SourceText />}
        </div>
      )}
      {noFinancialData && <span>No financial assistance data to show.</span>}
    </div>
  );
};

export default DetailsSection;
