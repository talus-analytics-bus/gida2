// 3rd party libs
import React, { useState, useEffect } from "react";

// styles
import styles from "./eventsidebar.module.scss";

// local components
import { MiniMap, ColList, PathogenBox } from "../";

const EventSidebar = ({}) => {
  return (
    <div className={styles.eventSidebar}>
      <MiniMap />
      <ColList />
      <PathogenBox />
    </div>
  );
};
export default EventSidebar;
