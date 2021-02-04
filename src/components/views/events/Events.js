// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./events.module.scss";
import classNames from "classnames";

// common
import EventTable from "../details/content/EventTable";
import { Loading } from "../../common/";

export const Events = ({ ...props }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false);

  // JSX //
  return (
    <div className={classNames("pageContainer", styles.events)}>
      <h2 className={styles.title}>PHEICs</h2>
      <Loading {...{ loaded, align: "center", message: "Loading events" }}>
        <div className={styles.intro}>Intro text.</div>
        <EventTable {...{ setLoaded }} />
      </Loading>
    </div>
  );
};
export default Events;
