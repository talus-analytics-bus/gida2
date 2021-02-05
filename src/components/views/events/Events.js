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
      <h2 className={styles.title}>PHEIC funding projects</h2>
      <Loading {...{ loaded, align: "center", message: "Loading PHEICs" }}>
        <div className={styles.instructions}>
          Choose PHEIC in table to view details. Each row is a project
          supporting the response to a particular PHEIC.
        </div>
        <EventTable {...{ setLoaded, sortByProp: "amount-disbursed_funds" }} />
      </Loading>
    </div>
  );
};
export default Events;
