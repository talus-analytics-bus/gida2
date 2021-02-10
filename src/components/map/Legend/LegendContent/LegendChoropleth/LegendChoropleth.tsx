import React, { FunctionComponent } from "react";
import styles from "./legendchoropleth.module.scss";
import classNames from "classnames";
import Shape, { ShapeType } from "../Shape/Shape";
import ValueLabel from "../ValueLabel/ValueLabel";
import { LegendEntries } from "../LegendContent";
type LegendChoroplethProps = {
  center: LegendEntries | null;
  left: LegendEntries | null;
  right: LegendEntries | null;
};

const getLegendEntriesComponent = (side: string, entries: LegendEntries) => {
  const colSize: string = side === "center" ? "1fr" : "auto";
  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${entries.colors.length}, ${colSize})`,
      }}
      className={classNames(styles.legendEntries, styles[side])}
    >
      {entries.colors.map((c, i) => (
        <div className={styles.legendEntry}>
          <Shape {...{ type: ShapeType.Rectangle, color: c }} />
          <div className={styles.label}>
            <div>
              <ValueLabel value={entries.labels[i]} />
            </div>
          </div>
        </div>
      ))}
      {side === "center" && (
        <div className={styles.legendEntry}>
          <Shape
            {...{
              type: ShapeType.Rectangle,
              color: "transparent",
            }}
          />
          <div className={styles.label}>
            <div>
              <ValueLabel value={"more"} />
            </div>
          </div>
        </div>
      )}
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
    {center !== null && getLegendEntriesComponent("center", center)}
    {right !== null && getLegendEntriesComponent("right", right)}
  </div>
);

export default LegendChoropleth;
