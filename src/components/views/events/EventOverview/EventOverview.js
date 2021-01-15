// 3rd party libs
import React, { useState, useEffect } from "react";
import styles from "./eventoverview.module.scss";

// local components
// common components
import SourceText from "../../../common/SourceText/SourceText";
import { DurationTimeline, EventNumberTotals } from "..";

// utility
import { NONE_VALS } from "../../../misc/Util";

const EventOverview = ({
  name,
  desc,
  start,
  start_desc,
  end,
  end_desc,
  was_pheic,
  pheic_start,
  pheic_end,
}) => {
  // FUNCTIONS //
  const getTimelinePoints = () => {
    const pheicPoints = [];
    if (was_pheic) {
      pheicPoints.push({
        date: pheic_start,
        desc: "WHO declared PHEIC",
        type: "pheic_start",
      });
      pheicPoints.push({
        date: pheic_end,
        desc: "WHO lifted PHEIC",
        type: "pheic_end",
      });
    }
    const validPoints = [
      { date: start, desc: start_desc, type: "start" },
      { date: end, desc: end_desc, type: "end" },
    ]
      .concat(pheicPoints)
      .filter(d => !NONE_VALS.includes(d.date));
    return validPoints;
  };

  const getIsOngoing = ps => {
    return !ps.some(d => d.type === "end");
  };

  // CONSTANTS //
  const points = getTimelinePoints();
  const isOngoing = getIsOngoing(points);
  const showDesc = !NONE_VALS.includes(desc);

  // JSX //
  return (
    <div className={styles.eventOverview}>
      <div className={styles.name}>{name}</div>
      {showDesc && (
        <p className={styles.desc}>
          {desc}
          <SourceText>Source: Placeholder</SourceText>
        </p>
      )}
      <DurationTimeline
        {...{
          points,
          isOngoing,
        }}
      />
      <EventNumberTotals {...{ type: "funding" }} />
      <EventNumberTotals {...{ type: "impacts" }} />
    </div>
  );
};
export default EventOverview;
