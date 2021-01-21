// 3rd party libs
import React, { useState, useLayoutEffect } from "react";

// styles, colors, and assets
import styles from "./events.module.scss";
import classNames from "classnames";
import { purples } from "../../map/MapUtil.js";

// local components
import {
  EventOverview,
  EventSidebar,
  EventBars,
  Sankey,
  Crossreferences,
} from ".";
import { Outbreak, Stakeholder, execute } from "../../misc/Queries";
import Loading from "../../common/Loading/Loading";
import EventTable from "../details/content/EventTable";
import DetailsSection from "../details/content/DetailsSection";

const Events = ({ slug, flowTypeInfo }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [stakeholders, setStakeholders] = useState({});
  const [countryImpacts, setCountryImpacts] = useState([]);
  const [curFlowType, setCurFlowType] = useState("committed_funds");
  // const [curFlowType, setCurFlowType] = useState("disbursed_funds");

  // FUNCTIONS //
  const getData = async () => {
    const results = await execute({
      queries: {
        outbreak: Outbreak({ slug, format: "event_page" }),
        stakeholders: Stakeholder({
          by: "iso3",
          filters: { "Stakeholder.cat": ["country", "world"] },
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
            ...d,
          };
        })
      );
    }
    setLoaded(true);
  };

  // CONSTANTS //
  // Get display name for current flow type
  const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
    .display_name;
  const isGlobal =
    countryImpacts.length === 1 && countryImpacts[0].label === "Global";
  const highlighted = countryImpacts
    .filter(d => d.iso3 !== undefined)
    .map(d => {
      return stakeholders[d.iso3].iso2;
    });

  const eventBars = data !== null && {
    header: <h2>Total funding and impact comparison</h2>,
    text: (
      <span>
        The chart below shows total funding by recipient and by funder.
        Recipient funding is compared to event impact, by either cases or
        deaths. Click on the name of a funder or recipient to view their
        profile.
      </span>
    ),
    content: <EventBars {...{ eventId: data.id, curFlowType }} />,
  };
  const sankey = {
    header: <h2>Flow of funding</h2>,
    text: (
      <span>
        The chart below shows who funded whom. Click on a funder or recipient to
        view their profile.
      </span>
    ),
    content: <Sankey />,
  };

  const eventTable = data !== null && {
    header: <h2>Top funders for {data.name}</h2>,
    text: (
      <span>
        The table below displays funders in order of amount of funds provided.
        Click on a funder or recipient to view their profile.
      </span>
    ),
    content: (
      <EventTable
        {...{
          hideName: true,
          eventId: data.id,
          curFlowType,
          curFlowTypeName,
          setEventTotalsData: () => "",
        }}
      />
    ),
  };

  const crossreferences = data !== null && {
    header: <h2>Case studies and DONS data</h2>,
    text: null,
    content: <Crossreferences />,
    showSource: false,
    toggleFlowType: false,
  };

  // collate subsections
  const subsections = [eventBars, sankey, eventTable, crossreferences];
  const subsectionsJsx = subsections.map(
    ({ header, text, content, toggleFlowType = true, ...props }) => (
      <DetailsSection
        {...{
          classes: [styles.subsection],
          header,
          text,
          content,
          toggleFlowType,
          flowTypeInfo,
          curFlowType,
          setCurFlowType,
          ...props,
        }}
      />
    )
  );

  // EFFECT HOOKS //
  useLayoutEffect(() => {
    getData();
  }, []);

  return (
    <div className={classNames(styles.events)}>
      <div className={classNames("pageContainer", styles.content)}>
        <div className={styles.title}>Outbreak event</div>

        {data !== null && (
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
                                      url: `/details/${sh.id}/${
                                        sh.primary_role
                                      }`,
                                      ...sh,
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
                      isGlobal,
                      highlighted,
                      pathogen: data.pathogen,
                      mcms_during_event: data.mcms_during_event,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.subsections}>{subsectionsJsx}</div>
          </Loading>
        )}
      </div>
      <div className={styles.band} />
    </div>
  );
};

export default Events;
