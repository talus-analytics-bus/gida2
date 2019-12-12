import React from "react";
import styles from "./detailssection.module.scss";

// FC for DetailsSection.
const DetailsSection = ({
  header,
  content,
  curFlowType,
  setCurFlowType,
  flowTypeInfo,
  toggleFlowType,
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
    <div className={styles.detailsSection}>
      {header}
      {toggleFlowType && (
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
      {content}
    </div>
  );
};

export default DetailsSection;
