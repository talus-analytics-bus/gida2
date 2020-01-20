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

/**
 * Create the main legend buckets based on the type of support that is being
 * plotted on the map. Note that the "unspecified" legend entry is created
 * separately.
 * @method getMainLegendBuckets
 * @param  {[type]}             colorScale  [description]
 * @param  {[type]}             supportType [description]
 * @return {[type]}                         [description]
 */
const getMainLegendBuckets = ({ colorScale, supportType }) => {
  // TODO setup so if fewer quantiles than colors in range, only use the ones
  // that make sense (otherwise you get repeated bucket labels).

  // Show units like USD in value label?
  const units = false;

  // Get colors of legend rectangles based on color scale.
  const colors = colorScale.range();

  // Is the "needs met" metric the one being plotted? Its legend is a little
  // special.
  const needsMetMetric = supportType === "needs_met";

  // Define JSX for value labels that are invisible which are used as spacers
  // in binary legends like the "needs met" legend.
  const legendSpacer = (
    <span style={{ color: "transparent" }}>
      .<br />.
    </span>
  );

  // Get the legend values that label each color rectangle in the legend
  // entry's "buckets" (one rectangle and one label per bucket).
  const legendVals = needsMetMetric
    ? [
        <span>
          Needs
          <br />
          unmet
        </span>,
        legendSpacer,
        legendSpacer,
        legendSpacer,
        legendSpacer,
        <span>
          Needs
          <br />
          met
        </span>
      ]
    : colorScale.values;

  // Get the buckets (rectangles and labels) for this legend entry.
  const buckets = legendVals.map((d, i) => (
    <div className={styles.bucket}>
      <div style={{ backgroundColor: colors[i] }} className={styles.rect} />
      <div className={styles.label}>
        {!needsMetMetric && Util.formatValue(d, supportType, units)}
        {needsMetMetric && d}
      </div>
    </div>
  ));

  // If an initial value (usually zero) needs to be appended to the far left
  // side of the first rectangle, add it. This only applies to quantile scales.
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

  // Return the full set of legend entry buckets.
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

/**
 * Create the legend for the map
 * @method Legend
 * @param  {[type]} colorScale  [description]
 * @param  {[type]} supportType [description]
 * @param  {[type]} flowType    [description]
 */
const Legend = ({
  colorScale,
  supportType,
  flowType,
  toggle,
  title,
  className
}) => {
  // Track whether legend is visible or not
  const [show, setShow] = React.useState(true);

  return (
    <div className={classNames(styles.legend, className)}>
      {toggle !== false && (
        <div className={classNames(styles.toggle, { [styles.flip]: show })}>
          <button onClick={() => setShow(!show)}>
            <span className={"caret"} />
            {show ? "hide" : "show"} legend
            <span className={"caret"} />
          </button>
        </div>
      )}
      <div className={classNames(styles.content, { [styles.show]: show })}>
        <div>
          {title === undefined && getLegendTitle({ supportType, flowType })}
          {title !== undefined && title}
        </div>
        <div className={styles.entries}>
          {getMainLegendBuckets({ colorScale, supportType })}
        </div>
      </div>
    </div>
  );
};

export default Legend;
