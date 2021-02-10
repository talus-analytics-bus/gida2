import React, { FunctionComponent } from "react";
import styles from "./legendordinal.module.scss";
import classNames from "classnames";
import Shape, { ShapeType } from "../Shape/Shape";

export type LegendOrdinalEntries = {
  colors: string[];
  labels: string[];
};

type LegendOrdinalProps = {
  center: LegendOrdinalEntries;
  left: LegendOrdinalEntries | null;
  right: LegendOrdinalEntries | null;
};

const getLegendEntriesComponent = (
  side: string,
  entries: LegendOrdinalEntries
) => {
  return (
    <div
      style={{ gridTemplateColumns: `repeat(${entries.colors.length}, 1fr)` }}
      className={classNames(styles.legendEntries, styles[side])}
    >
      {entries.colors.map((c, i) => (
        <div className={styles.legendEntry}>
          <Shape {...{ type: ShapeType.Rectangle, color: c }} />
          <div className={styles.label}>{entries.labels[i]}</div>
        </div>
      ))}
    </div>
  );
};

const LegendOrdinal: FunctionComponent<LegendOrdinalProps> = ({
  center,
  left,
  right,
}) => (
  <div className={styles.legendOrdinal}>
    {left !== null && getLegendEntriesComponent("left", left)}
    {getLegendEntriesComponent("center", center)}
    {right !== null && getLegendEntriesComponent("right", right)}
  </div>
);

export default LegendOrdinal;
