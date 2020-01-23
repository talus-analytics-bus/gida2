import React from "react";
import classNames from "classnames";
import styles from "./scoreblocks.module.scss";

/**
 * @method ScoreBlocks
 */
const ScoreBlocks = ({ value, rangeArray, colors, ...props }) => {
  const showBlocks = value !== -9999;
  const displayValue = value !== -9999 ? value : "N/A";
  return (
    <div className={styles.scoreBlocks}>
      <div className={styles.value}>{displayValue}</div>
      {showBlocks && (
        <div className={styles.blocks}>
          {rangeArray.map((d, i) => (
            <div
              style={{ backgroundColor: d === value ? colors[i] : "" }}
              className={classNames(styles.block, {
                [styles.active]: d === value
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default ScoreBlocks;
