import React from "react";
import styles from "./legend.module.scss";

/**
 * Given the support type and flow type, returns the correct legend title.
 * @method getLegendTitle
 * @param  {[type]}       supportType [description]
 * @param  {[type]}       flowType    [description]
 * @return {[type]}                   [description]
 */
const getLegendTitle = ({ supportType, flowType }) => {
  switch (supportType) {
    case "jee":
      return "Average JEE score for selected core capacities";
    case "needs_met":
      return "Funds received relative to need level";
    default:
      return supportType;
    case "funds":
    case "inkind":
      switch (flowType) {
        case "disbursed_funds":
          return "Funds received (in USD)";
        case "committed_funds":
          return "Funds committed (in USD)";
        case "provided_inkind":
          return "In-kind support projects received";
        case "committed_inkind":
          return "In-kind support projects committed";
        default:
          return flowType;
      }
  }
};
const Legend = ({ colorScale, supportType, flowType }) => {
  return (
    <div className={styles.legend}>
      <div>{getLegendTitle({ supportType, flowType })}</div>
    </div>
  );
};

export default Legend;
