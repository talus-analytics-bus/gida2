// 3rd party libs
import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import moment from "moment";
import * as d3 from "d3/dist/d3.min";

// styles and assets
import styles from "./durationtimeline.module.scss";
import tooltipStyles from "../../../common/tooltip.module.scss";

// utility
import { getIntArray, floatToPctString } from "../../../misc/Util";

// local components
import Dot from "./Dot/Dot";

const DurationTimeline = ({ points }) => {
  // FUNCTIONS //
  // get timeline data from points
  const getTimelineDataFromPoints = ps => {
    // convert string dates into moments
    ps.forEach(p => (p.m = moment(p.date)));

    // get min and max
    const max = d3.max(ps, p => p.m);
    const min = d3.min(ps, p => p.m);

    // define timeline bounds
    const left = moment(min).startOf("year");
    const right = moment(max).endOf("year");

    // define relative positions of dots
    const den = right - left;
    const getRelPos = (p, l) => {
      const num = p.m - left;
      return 100.0 * (num / den);
    };
    ps.forEach(p => {
      const x = getRelPos(p, left);
      p.x = x;
      p.left = floatToPctString(x);
    });

    const getMidOfYear = y => {
      const m = moment(`${y}-01-01`);
      const s = m;
      const e = moment(m).endOf("year");
      const mid = moment(s).add((e - s) / 2);
      return mid;
    };

    const getYearsFromPoints = (ps, l) => {
      const ysTmp = [...new Set(ps.map(p => p.m.year()))].sort();
      const ys = [];
      // fill in any missing years
      let prvY = ysTmp[0] - 1;
      ysTmp.forEach(y => {
        if (y == prvY - 1) {
          ys.push(y);
          return;
        } else {
          while (prvY < y) {
            ys.push(prvY + 1);
            prvY = prvY + 1;
          }
        }
      });
      const ms = ys.map(y => getMidOfYear(y));
      const yls = ms.map(m => {
        const x = getRelPos({ m }, l);
        return { x, left: floatToPctString(x), l: m.year().toString(), m: m };
      });
      return yls;
    };

    const getTicksFromYears = (ys, l) => {
      const ts = [];
      ys.forEach((y, i) => {
        const x1 = getRelPos({ m: moment(y.m).startOf("year") }, l);
        ts.push(floatToPctString(x1));
        if (i === ys.length - 1) {
          const x2 = getRelPos({ m: moment(y.m).endOf("year") }, l);
          ts.push(floatToPctString(x2));
        }
      });
      return ts;
    };

    const ys = getYearsFromPoints(ps, left);
    const ts = getTicksFromYears(ys, left);

    // sort points by descending date
    ps.sort(function(a, b) {
      if (a.m > b.m) return 1;
      else if (a.m < b.m) return -1;
      else return 0;
    });

    return [ps, ys, ts];
  };

  // FUNCTION CALLS //
  // get dot positions
  const [dots, years, ticks] = getTimelineDataFromPoints(points);

  const getThickStartEndFromPoints = ps => {
    if (ps.length <= 1) return [0, 0];
    else {
      const [s, e] = [ps[0].x, ps[ps.length - 1].x];
      const l = e - s;
      // [s, s + l]
      const w = floatToPctString(l);
      return [floatToPctString(s), w];
    }
  };
  const [thickStart, thickWidth] = getThickStartEndFromPoints(dots);

  // EFFECTS //
  // rebuild tooltips on load
  useEffect(ReactTooltip.rebuild, []);
  ReactTooltip.rebuild();

  // JSX //
  return (
    <>
      <div className={styles.durationTimeline}>
        <div className={styles.title}>Duration</div>
        <div className={styles.track}>
          <div className={styles.ticks}>
            {ticks.map(t => (
              <div style={{ left: t.left }} className={styles.tick} />
            ))}
          </div>
          <div
            style={{ left: thickStart, width: thickWidth }}
            className={styles.thickTrack}
          />
          <div className={styles.dots}>
            {dots.map(d => (
              <Dot {...{ ...d, key: d.date }} />
            ))}
          </div>
        </div>
        <div className={styles.years}>
          {years.map(t => (
            <div style={{ left: t.left }} className={styles.year}>
              {t.l}
            </div>
          ))}
        </div>
      </div>
      {
        // Info tooltip that is displayed whenever a dot is hovered
        <ReactTooltip
          id={"dotTip"}
          class={tooltipStyles.tooltip}
          type="light"
          effect="float"
          place="top"
          delayHide={250}
          clickable={false}
          getContent={d => d}
        />
      }
    </>
  );
};
export default DurationTimeline;
