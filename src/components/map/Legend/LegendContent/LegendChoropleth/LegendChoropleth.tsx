import React, { FunctionComponent } from "react";
import styles from "./legendchoropleth.module.scss";
import classNames from "classnames";
import Shape, { ShapeType } from "../Shape/Shape";
import ValueLabel from "../ValueLabel/ValueLabel";

export type LegendChoroplethEntries = {
  colors: string[];
  labels: string[];
};

type LegendChoroplethProps = {
  center: LegendChoroplethEntries;
  left: LegendChoroplethEntries | null;
  right: LegendChoroplethEntries | null;
};

const getLegendEntriesComponent = (
  side: string,
  entries: LegendChoroplethEntries
) => {
  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${entries.colors.length}, 1fr)`,
      }}
      className={classNames(styles.legendEntries, styles[side])}
    >
      {entries.colors.map((c, i) => (
        <div className={styles.legendEntry}>
          <Shape {...{ type: ShapeType.Rectangle, color: c }} />
          <div className={styles.label}>
            <ValueLabel value={entries.labels[i]} />
          </div>
        </div>
      ))}
      <div className={styles.legendEntry}>
        <Shape
          {...{
            type: ShapeType.Rectangle,
            color: "transparent",
          }}
        />
        <div className={styles.label}>
          <ValueLabel value={"more"} />
        </div>
      </div>
    </div>
  );
};

const LegendChoropleth: FunctionComponent<LegendChoroplethProps> = ({
  center,
  left,
  right,
}) => (
  <div className={styles.legendChoropleth}>
    {left !== null && getLegendEntriesComponent("left", left)}
    {getLegendEntriesComponent("center", center)}
    {right !== null && getLegendEntriesComponent("right", right)}
  </div>
);

export default LegendChoropleth;
