import React from "react";
import styles from "./legend.module.scss";
import classNames from "classnames";
import Util from "../misc/Util.js";

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

const getMainLegendBuckets = ({ colorScale, supportType }) => {
  // TODO setup so if fewer quantiles than colors in range, only use the ones
  // that make sense (otherwise you get repeated bucket labels).
  const units = false;
  const colors = colorScale.range();
  const needsMetMetric = supportType === "needs_met";
  const legendSpacer = (
    <span style={{ color: "transparent" }}>
      .<br />.
    </span>
  );
  const legendVals = needsMetMetric
    ? [
        <span>
          Needs
          <br />
          met
        </span>,
        legendSpacer,
        legendSpacer,
        legendSpacer,
        legendSpacer,
        <span>
          Needs
          <br />
          unmet
        </span>
      ]
    : colorScale.values;
  const buckets = legendVals.map((d, i) => (
    <div className={styles.bucket}>
      <div style={{ backgroundColor: colors[i] }} className={styles.rect} />
      <div className={styles.label}>
        {!needsMetMetric && Util.formatValue(d, supportType, units)}
        {needsMetMetric && d}
      </div>
    </div>
  ));
  const initLabelVal =
    colorScale.type === "scaleOrdinal" || needsMetMetric ? undefined : 0;
  const initLabel = initLabelVal !== undefined && (
    <div className={classNames(styles.bucket, styles.init)}>
      <div className={styles.rect} />
      <div className={styles.label}>
        {Util.formatValue(initLabelVal, supportType, units)}
      </div>
    </div>
  );

  return (
    <div
      className={classNames(styles.entry, styles[colorScale.type], {
        [styles.binary]: needsMetMetric
      })}
    >
      {initLabel}
      {buckets}
    </div>
  );
};
const Legend = ({ colorScale, supportType, flowType }) => {
  return (
    <div className={styles.legend}>
      <div className={styles.entries}>
        {getMainLegendBuckets({ colorScale, supportType })}
      </div>
      <div>{getLegendTitle({ supportType, flowType })}</div>
    </div>
  );
};

export default Legend;
