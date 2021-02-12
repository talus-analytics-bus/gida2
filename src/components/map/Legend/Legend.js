import React from "react";
import styles from "./legend.module.scss";
import classNames from "classnames";
import Util from "../../misc/Util.js";
import SlideToggle from "../../common/SlideToggle/SlideToggle.js";
import LegendContent, { LegendType } from "./LegendContent/LegendContent";

/**
 * Given the support type and flow type, returns the correct legend title.
 * @method getLegendTitle
 * @param  {[type]}       supportType [description]
 * @param  {[type]}       flowType    [description]
 * @return {[type]}                   [description]
 */
const getLegendTitle = ({ supportType, flowType, entityRole }) => {
  const f = entityRole === "funder";
  const currency = "(in USD)";
  switch (supportType) {
    case "jee":
      return "Average JEE score for selected core capacities";
    case "needs_met":
      return "Funds received relative to need level";
    default:
      return supportType;
    case "funds_and_inkind":
    case "funds":
    case "inkind":
      switch (flowType) {
        case "disbursed_funds":
          return f
            ? `Funds disbursed ${currency}`
            : `Disbursed funds received ${currency}`;
        case "committed_funds":
          return f
            ? `Funds committed ${currency}`
            : `Committed funds received ${currency}`;
        case "provided_inkind":
          return f
            ? "In-kind support projects provided"
            : "In-kind support projects received";
        case "committed_inkind":
          return f
            ? "In-kind support projects committed"
            : "Committed in-kind support projects received";
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
  let colors = colorScale.range();

  // Is the "needs met" metric the one being plotted? Its legend is a little
  // special.
  const needsMetMetric = supportType === "needs_met";
  const numericMetric =
    supportType === "funds" ||
    supportType === "inkind" ||
    supportType === "funds_and_inkind";
  const scoreMetric = supportType === "jee" || supportType === "pvs";

  // Define JSX for value labels that are invisible which are used as spacers
  // in binary legends like the "needs met" legend.
  const legendSpacer = (
    <span style={{ color: "transparent" }}>
      .<br />.
    </span>
  );

  // Get the legend values that label each color rectangle in the legend
  // entry's "buckets" (one rectangle and one label per bucket).
  let legendVals = needsMetMetric
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
        </span>,
      ]
    : colorScale.values.filter(d => d !== undefined);

  // If no entries, return blank;
  if (legendVals.length === 0) return <div />;

  // Add extra value for numeric metrics
  if (numericMetric) legendVals.push("more");

  // Remove duplicates
  if (numericMetric)
    legendVals = legendVals.filter((d, i) => {
      if (i === legendVals.length - 1) return true;
      else if (legendVals[i] === legendVals[i + 1]) {
        // Remove the NEXT color.
        colors[i + 1] = -9999;
        // Remove this value
        return false;
      } else {
        return true;
      }
    });
  // Remove unused colors
  colors = colors.filter(d => d !== -9999);

  // Get the buckets (rectangles and labels) for this legend entry.
  const buckets = legendVals.map((d, i) => (
    <div className={styles.bucket}>
      <div style={{ backgroundColor: colors[i] }} className={styles.rect} />
      <div className={styles.label}>
        {scoreMetric && Util.formatValue(d, supportType, units, true)}
        {!scoreMetric &&
          !needsMetMetric &&
          i < legendVals.length - 1 &&
          Util.formatValue(d, supportType, units, true)}
        {!scoreMetric && numericMetric && i >= legendVals.length - 1 && (
          <span>{d}</span>
        )}
        {!scoreMetric && needsMetMetric && d}
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
  if (needsMetMetric) {
    return (
      <div className={classNames(styles.bucket)}>
        <div className={classNames(styles.rect, styles.gradient)} />
        <div className={styles.labels}>
          <div className={styles.label}>
            <span>
              Needs
              <br />
              unmet
            </span>
          </div>
          <div className={styles.label}>
            <span>
              Needs
              <br />
              met
            </span>
          </div>
        </div>
      </div>
    );
  } else
    return (
      <div
        className={classNames(styles.entry, styles[colorScale.type], {
          [styles.binary]: needsMetMetric,
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
  className,
  isDark,
  entityRole,
  ...props
}) => {
  // STATE //
  // Track whether legend is visible or not
  const [show, setShow] = React.useState(true);

  let type;
  if (supportType === "jee") {
    type = LegendType.Ordinal;
  } else if (supportType === "needs_met") {
    type = LegendType.Continuous;
  } else {
    type = LegendType.Choropleth;
  }
  // CONSTANTS //
  const legendTitle =
    title || getLegendTitle({ supportType, flowType, entityRole });

  const showInkindHatch =
    type === LegendType.Choropleth && supportType === "funds_and_inkind";
  const sides = {
    center: null,
    left: null,
    right: !showInkindHatch
      ? null
      : {
          colors: ["transparent:striped-#848484"],
          labels: ["In-kind support " + flowType.split("_")[0]],
        },
  };

  return (
    <div
      className={classNames(styles.legend, className, {
        [styles.dark]: isDark,
      })}
    >
      {toggle !== false && (
        <SlideToggle {...{ label: "legend", show, setShow }} />
      )}
      <div
        style={props.style}
        className={classNames(styles.content, { [styles.show]: show })}
      >
        <LegendContent
          {...{ title: legendTitle, type, scale: colorScale, sides }}
        />
      </div>
    </div>
  );
};

export default Legend;
