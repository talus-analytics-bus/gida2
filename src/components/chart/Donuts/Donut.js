import React from "react";
import Util from "../../misc/Util.js";
import styles from "./donut.module.scss";
import D3Donut from "./D3Donut.js";
import classNames from "classnames";
import { greens, purples } from "../../map/MapUtil.js";

// FC
const Donut = ({
  numerator,
  denominator,
  attribute,
  attrFormatter,
  nodeType,
  flowType,
  idx,
  id,
  ...props
}) => {
  const [chart, setChart] = React.useState(null);
  React.useEffect(() => {
    const chartNew = new D3Donut(`.${styles.donutChart}.${idx}`, {
      pct: numerator / denominator,
      color:
        nodeType === "target"
          ? purples[purples.length - 1]
          : greens[greens.length - 1]
    });
    setChart(chartNew);
  }, [flowType, id, nodeType]);

  return (
    <div className={styles.donut}>
      <div className={styles.label}>{attrFormatter(attribute)}</div>
      <div className={classNames(styles.donutChart, idx)} />
    </div>
  );
};

export default Donut;
