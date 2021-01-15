// 3rd party libs
import React, { useState, useLayoutEffect } from "react";

// styles, colors, and assets
import styles from "./events.module.scss";
import classNames from "classnames";
import { purples } from "../../map/MapUtil.js";

// local components
import { EventOverview } from ".";
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

  // FUNCTIONS //
  const getData = async () => {
    const results = await execute({ queries: { outbreak: Outbreak({ id }) } });
    setData(results.outbreak.find(d => +d.id === +id)); // TODO get one outbreak only
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
              <div className={classNames(styles.col, styles.right)} />
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
