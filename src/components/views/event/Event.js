// 3rd party libs
import React, { useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";

// styles, colors, and assets
import styles from "./event.module.scss";
import classNames from "classnames";

// local components
import {
  EventOverview,
  EventSidebar,
  EventBars,
  // Sankey,
  Crossreferences,
} from ".";
import { Outbreak, Stakeholder, execute } from "../../misc/Queries";
import { Loading } from "../../common";
import EventTable from "../details/content/EventTable";
import DetailsSection from "../details/content/DetailsSection";

const Event = ({ slug, flowTypeInfo }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [stakeholders, setStakeholders] = useState({});
  const [countryImpacts, setCountryImpacts] = useState([]);
  // const [curFlowType, setCurFlowType] = useState("disbursed_funds");
  const [curFlowType, setCurFlowType] = useState("committed_funds");
  const [caseData, setCaseData] = useState(null);
  const [deathData, setDeathData] = useState(null);
  const [noFundingData, setNoFundingData] = useState(false);

  // FUNCTIONS //
  const getData = async () => {
    const results = await execute({
      queries: {
        outbreak: Outbreak({ slug, format: "event_page" }),
        stakeholders: Stakeholder({
          by: "iso3",
          filters: { "Stakeholder.subcat": ["country", "world"] },
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
  // data loaded?
  const dataLoaded = data !== null;

  // Get display name for current flow type
  const isGlobal =
    countryImpacts.length === 1 && countryImpacts[0].label === "Global";
  const highlighted = countryImpacts
    .filter(d => d.iso3 !== undefined)
    .map(d => {
      return stakeholders[d.iso3].iso2;
    });

  const eventBars = dataLoaded && {
    header: (
      <h2>
        Funders and recipients <h4>for {data.name}</h4>
      </h2>
    ),
    text: (
      <span>
        The chart below shows total funding by recipient or by funder. Recipient
        funding is compared to event impact, by either cases or deaths, when
        available. Hover over stacked bar sections or labels to view details.
      </span>
    ),
    content: (
      <EventBars
        {...{
          eventId: data.id,
          curFlowType,
          caseData,
          deathData,
          stakeholders,
          hasImpactsData:
            data.source_of_cases_and_deaths !== "Static CSV" ||
            data.cases_and_deaths_json.some(d => d.iso3 !== "GLB"),
        }}
      />
    ),
    noDataContent: (
      <i>
        There are no funding data for this event yet.{" "}
        <Link to={"/about/submit"}>Click here to submit data</Link>.
      </i>
    ),
  };
  // const sankey = dataLoaded && {
  //   header: <h2>Flow of funding</h2>,
  //   text: (
  //     <span>
  //       The chart below shows who funded whom. Click on a funder or recipient's
  //       name to view their profile. Click on a rectangle to pin/unpin
  //       highlights.
  //     </span>
  //   ),
  //   content: <Sankey {...{ eventId: data.id, curFlowType }} />,
  // };

  const eventTable = dataLoaded &&
    !noFundingData && {
      header: (
        <h2>
          Projects <h4>for {data.name}</h4>
        </h2>
      ),
      text: (
        <span>
          The table below displays PHEIC response projects in order of amount of
          funds provided. Click on a funder or recipient to view their profile.
          Note that some projects funding more PHEICs than just this one may be
          listed, and the amount shown is the total for all.
        </span>
      ),
      toggleFlowType: false,
      content: (
        <EventTable
          {...{
            hideName: true,
            eventId: data.id,
            setEventTotalsData: () => "",
            sortByProp: "amount",
          }}
        />
      ),
    };

  // get crossreferences section dynamic title
  const hasDons = data !== null && data.any_dons;
  const hasCaseStudies = data !== null && data.int_refs.length > 0;
  const titleArr = [];
  if (hasCaseStudies) titleArr.push("Case studies");
  if (hasDons) titleArr.push("DONs data");
  const title = titleArr.join(" and ");

  const crossreferences = dataLoaded && {
    header: (
      <h2>
        {title}
        <h4>for {data.name}</h4>
      </h2>
    ),
    text: null,
    content: <Crossreferences {...{ ...data, hasCaseStudies, hasDons }} />,
    showSource: false,
    toggleFlowType: false,
    hide: !hasCaseStudies && !hasDons,
  };

  // collate subsections
  // const subsections = [eventBars, eventTable, crossreferences].filter(
  const subsections = [eventBars, eventTable, crossreferences].filter(
    d => d.hide !== true && d !== false
  );
  const subsectionsJsx = subsections.map(
    ({
      header,
      text,
      content,
      toggleFlowType = true,
      noDataContent = null,
      ...props
    }) => (
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
          noFinancialData: noFundingData && noDataContent !== null,
          noDataContent: (
            <p className={styles.noDataContent}>
              There are no funding data for this event yet.{" "}
              <Link to={"/about/submit"}>Click here to submit data</Link>.
            </p>
          ),
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
        <div className={styles.title}>PHEIC</div>

        {dataLoaded && (
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
                        caseData,
                        setCaseData,
                        deathData,
                        setDeathData,
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

export default Event;
