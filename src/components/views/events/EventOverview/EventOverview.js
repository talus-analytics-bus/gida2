// 3rd party libs
import React, { useState, useEffect } from "react";
import styles from "./eventoverview.module.scss";

// local components
// common components
import SourceText from "../../../common/SourceText/SourceText";
import { DurationTimeline, EventNumberTotals } from "..";

const EventOverview = ({ name, desc, start, start_desc, end, end_desc }) => {
  return (
    <div className={styles.eventOverview}>
      <div className={styles.name}>{name}</div>
      <p className={styles.desc}>
        {desc}
        <SourceText>Source: Placeholder</SourceText>
      </p>
      <DurationTimeline
        {...{
          points: [
            { date: start, desc: start_desc },
            { date: end, desc: end_desc },
          ],
        }}
      />
      <EventNumberTotals {...{ type: "funding" }} />
      <EventNumberTotals {...{ type: "impacts" }} />
    </div>
  );
};
export default EventOverview;
