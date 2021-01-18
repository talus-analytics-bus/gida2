// 3rd party libs
import React, { useState, useLayoutEffect } from "react";

// styles, colors, and assets
import styles from "./events.module.scss";
import classNames from "classnames";
import { purples } from "../../map/MapUtil.js";

// local components
import { EventOverview, EventSidebar } from ".";
import { Outbreak, Stakeholder, execute } from "../../misc/Queries";

// import { EventOverview, EventSidebar, EventBars, Sankey } from ".";
import Loading from "../../common/Loading/Loading";

const Events = ({ id }) => {
  const defaultData = {
    title: "2014-2016 Ebola in West Africa",
  };

  // STATE //
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(defaultData);
  const [stakeholders, setStakeholders] = useState({});
  const [countryImpacts, setCountryImpacts] = useState([]);

  // FUNCTIONS //
  const getData = async () => {
    const results = await execute({
      queries: {
        outbreak: Outbreak({ id, format: "event_page" }),
        stakeholders: Stakeholder({
          by: "iso3",
          filters: { "Stakeholder.cat": ["country"] },
        }),
      },
    });
    setData(results.outbreak);
    setStakeholders(results.stakeholders);

    const countryImpacts = results.outbreak.country_impacts;
    if (results.outbreak.case_data_id === null) {
      setCountryImpacts(
        countryImpacts.map(d => {
          return {
            url: `/details/${d.id}/${d.primary_role}`,
            label: results.stakeholders[d.iso3].name,
          };
        })
      );
    }
    setLoaded(true);
  };

  // EFFECT HOOKS //
  useLayoutEffect(() => {
    getData();
  }, []);

  return (
    <div className={classNames(styles.events)}>
      <div className={classNames("pageContainer", styles.content)}>
        <div className={styles.title}>Outbreak event</div>

        <Loading
          {...{
            loaded,
            slideUp: true,
            minHeight: "75vh",
            top: "-20px",
          }}
        >
          <div className={styles.card}>
            <div className={styles.cols}>
              <div className={classNames(styles.col, styles.left)}>
                {loaded && (
                  <EventOverview
                    {...{
                      ...data,
                      // assign affected countries from cases data
                      afterCaseData:
                        data.case_data_id !== null
                          ? d => {
                              const formattedCountryImpacts = d.map(dd => {
                                const sh = stakeholders[dd.iso3];
                                if (sh === undefined) return {};
                                else
                                  return {
                                    label: sh.name,
                                    url: `/details/${sh.id}/${sh.primary_role}`,
                                  };
                              });
                              setCountryImpacts(formattedCountryImpacts);
                            }
                          : undefined,
                    }}
                  />
                )}
              </div>
              <div className={classNames(styles.col, styles.right)}>
                <EventSidebar
                  {...{
                    countryImpacts,
                    pathogen: data.pathogen,
                    mcms_during_event: data.mcms_during_event,
                  }}
                />
              </div>
            </div>
          </div>
        </Loading>

        <div className={styles.subsections} />
      </div>
      <div className={styles.band} />
    </div>
  );
};

export default Events;
