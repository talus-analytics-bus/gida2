// 3rd party libs
import React, { useState, useLayoutEffect } from "react";

// styles, colors, and assets
import styles from "./events.module.scss";
import classNames from "classnames";
import { purples } from "../../map/MapUtil.js";

// local components
import { EventOverview, EventSidebar } from ".";
import { Outbreak, execute } from "../../misc/Queries";

// import { EventOverview, EventSidebar, EventBars, Sankey } from ".";
import Loading from "../../common/Loading/Loading";

const Events = ({ id }) => {
  const defaultData = {
    title: "2014-2016 Ebola in West Africa",
  };

  // STATE //
  const [loaded, setLoaded] = useState(true);
  const [data, setData] = useState(defaultData);
  const [countryImpacts, setCountryImpacts] = useState([]);

  // FUNCTIONS //
  const getData = async () => {
    const results = await execute({
      queries: { outbreak: Outbreak({ id, format: "event_page" }) },
    });
    setData(results.outbreak);

    const countryImpacts = results.outbreak.country_impacts.map(d => {
      return {
        label: d.name,
        url:
          d.name !== "Global"
            ? `/details/${d.id}/${d.primary_role}`
            : undefined,
      };
    });
    setCountryImpacts(countryImpacts);
  };

  // EFFECT HOOKS //
  useLayoutEffect(() => {
    getData();
  }, []);

  return (
    <Loading {...{ loaded }}>
      {/* page header, color band, name */}
      <div className={classNames(styles.events)}>
        <div className={classNames("pageContainer", styles.content)}>
          <div className={styles.title}>Outbreak event</div>

          <div className={styles.card}>
            <div className={styles.cols}>
              <div className={classNames(styles.col, styles.left)}>
                <EventOverview {...{ ...data }} />
              </div>
              <div className={classNames(styles.col, styles.right)}>
                <EventSidebar {...{ countryImpacts }} />
              </div>
            </div>
          </div>

          <div className={styles.subsections} />
        </div>
        <div className={styles.band} />
      </div>
    </Loading>
  );
};

export default Events;
