// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./events.module.scss";
import classNames from "classnames";

// common and local components
import EventTable from "../details/content/EventTable";
import PheicList from "./PheicList";
import { Loading } from "../../common/";

export const Events = ({ ...props }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false);

  // JSX //
  return (
    <div className={classNames("pageContainer", styles.events)}>
      <article>
        <h2 className={styles.title}>What are PHEICs?</h2>
        <p>
          PHEICs are{" "}
          <strong>public health emergencies of international concern</strong>.
          The{" "}
          <a
            href={"https://www.who.int/publications/i/item/9789241580496"}
            target={"_blank"}
          >
            {" "}
            International Health Regulations (2005)
          </a>{" "}
          define a PHEIC as "an extraordinary event that may constitute a public
          health risk to other countries through international spread of disease
          and may require an international coordinated response."
        </p>
        <p>
          Six PHEICs have been declared to date, listed in chronological order
          below. Click a PHEIC below to view the funding provided and received
          for the response to the PHEIC, as well as details including a
          description of the event and the pathogen.
        </p>
        <PheicList />
      </article>
      <h2 className={styles.title}>PHEIC funding projects</h2>
      <Loading {...{ loaded, align: "center" }}>
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
