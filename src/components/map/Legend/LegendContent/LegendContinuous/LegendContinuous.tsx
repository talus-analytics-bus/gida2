import React, { FunctionComponent } from "react";
import styles from "./legendcontinuous.module.scss";
import classNames from "classnames";
import Shape, { ShapeType } from "../Shape/Shape";
import ValueLabel from "../ValueLabel/ValueLabel";
import { LegendEntries } from "../LegendContent";
import { getLegendEntriesComponent as getOrdinalLegendComponent } from "../LegendOrdinal/LegendOrdinal";
type LegendContinuousProps = {
  center: LegendEntries | null;
  left: LegendEntries | null;
  right: LegendEntries | null;
};

const getLegendEntriesComponent = (side: string, entries: LegendEntries) => {
  if (side !== "center") return getOrdinalLegendComponent(side, entries);
  else
    return (
      <div className={classNames(styles.legendEntries, styles[side])}>
        <div className={styles.legendEntry}>
          <Shape
            {...{
              type: ShapeType.Gradient,
              color: `:gradient-${entries.colors[0]}-${entries.colors[1]}`,
            }}
          />
          <div className={styles.labels}>
            <div className={styles.label}>
              <ValueLabel value={entries.labels[0]} />
            </div>
            <div className={styles.label}>
              <ValueLabel value={entries.labels[1]} />
            </div>
          </div>
        </div>
      </div>
    );
};

const LegendContinuous: FunctionComponent<LegendContinuousProps> = ({
  center,
  left,
  right,
}) => (
  <div className={styles.legendContinuous}>
    {left !== null && getLegendEntriesComponent("left", left)}
    {center !== null && getLegendEntriesComponent("center", center)}
    {right !== null && getLegendEntriesComponent("right", right)}
  </div>
);

export default LegendContinuous;
