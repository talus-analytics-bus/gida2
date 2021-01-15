// 3rd party libs
import React, { useState, useEffect } from "react";
import styles from "./eventoverview.module.scss";

// local components
// common components
import SourceText from "../../../common/SourceText/SourceText";
import { DurationTimeline, EventNumberTotals } from "..";

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
      pheicPoints.push({ date: pheic_start, desc: "WHO declared PHEIC" });
      pheicPoints.push({ date: pheic_end, desc: "WHO lifted PHEIC" });
    }
    return [
      { date: start, desc: start_desc },
      { date: end, desc: end_desc },
    ].concat(pheicPoints);
  };

  // CONSTANTS //
  const points = getTimelinePoints();

  // JSX //
  return (
    <div className={styles.eventOverview}>
      <div className={styles.name}>{name}</div>
      <p className={styles.desc}>
        {desc}
        <SourceText>Source: Placeholder</SourceText>
      </p>
      <DurationTimeline
        {...{
          points,
        }}
      />
      <EventNumberTotals {...{ type: "funding" }} />
      <EventNumberTotals {...{ type: "impacts" }} />
    </div>
  );
};
export default EventOverview;
