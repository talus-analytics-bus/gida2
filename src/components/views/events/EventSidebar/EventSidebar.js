// 3rd party libs
import React, { useState, useEffect } from "react";

// styles
import styles from "./eventsidebar.module.scss";

// local components
import { MiniMap, ColList, PathogenBox } from "../";

const EventSidebar = ({
  countryImpacts,
  isGlobal,
  pathogen,
  mcms_during_event,
  stakeholders,
  highlighted,
}) => {
  return (
    <div className={styles.eventSidebar}>
      <MiniMap {...{ highlighted, isGlobal }} />
      <ColList {...{ items: countryImpacts, isGlobal }} />
      <PathogenBox {...{ ...pathogen, mcms_during_event }} />
    </div>
  );
};
export default EventSidebar;
