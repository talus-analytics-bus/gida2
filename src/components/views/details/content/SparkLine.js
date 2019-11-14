import React from 'react';
import SparkLineChart from './SparkLineChart.js';
import styles from './sparkline.module.scss';
import classNames from 'classnames';

/**
 * Generic sparkline chart
 * @method SparkLine
 */
const SparkLine = (props) => {

  React.useEffect(function initSparkLine () {

    // Init sparkline data series
    const params = {
      data: props.data,
      window: props.window,
      margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      }
    };

    // Create sparkline chart
    const chart = new SparkLineChart (
      '.' + styles.sparklineContainer + '-' + props.i,
      params,
    );

  }, [])


  return (
    <div
      className={classNames(
        styles.sparklineContainer,
        styles.sparklineContainer + '-' + props.i,
        styles[props.direction],
      )}
    >
    </div>
  );
};

export default SparkLine;
