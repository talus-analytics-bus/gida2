import React from "react";
import classNames from "classnames";
import styles from "./mapviewer.module.scss";
import EntityRoleToggle from "../../../../misc/EntityRoleToggle.js";
import GhsaToggle from "../../../../misc/GhsaToggle.js";
import RadioToggle from "../../../../misc/RadioToggle.js";
import { Settings } from "../../../../../App.js";
import Util from "../../../../misc/Util.js";
import {
  execute,
  NodeSums,
  Assessment,
  Outbreak,
} from "../../../../misc/Queries";
import TimeSlider from "../../../../misc/TimeSlider.js";
import CoreCapacityDropdown from "../../../../misc/CoreCapacityDropdown.js";
import FilterDropdown from "../../../../common/FilterDropdown/FilterDropdown.js";
import FilterSelections from "../../../../common/FilterSelections/FilterSelections.js";
import FlowBundleFocusQuery from "../../../../misc/FlowBundleFocusQuery.js";
import ScoreQuery from "../../../../misc/ScoreQuery.js";
import OutbreakQuery from "../../../../misc/OutbreakQuery.js";
import Tab from "../../../../misc/Tab.js";
import { core_capacities } from "../../../../misc/Data.js";
import SlideToggle from "../../../../common/SlideToggle/SlideToggle.js";
import Button from "../../../../common/Button/Button.js";

// Local content components
import Map from "./content/Map.js";

// FC for MapViewer.
const MapViewer = ({
  data,
  entityRole,
  setEntityRole,
  fundType,
  setFundType,
  minYear,
  setMaxYear,
  setMinYear,
  maxYear,
  coreCapacities,
  setCoreCapacities,
  events,
  setEvents,
  flowTypeInfo,
  isDark,
  supportTypeDefault,
  setLoadingSpinnerOn,
  setSupportTypeToSwitchTo,
  setPageHeaderData,
  ...props
}) => {
  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = React.useState("disbursed");

  // Track support type selected for the map
  const [supportType, setSupportType] = React.useState(
    supportTypeDefault || "funds"
  );

  // define score toggle options
  const score_toggle_data = [
    {
      name: "JEE score",
      value: "jee",
      tooltip:
        "The Joint External Evaluation tool (JEE) measures country-specific progress in developing the capacities needed to prevent, detect, and respond to public health threats.",
    },
  ];

  // same for combined toggle options
  const combined_toggle_data = [
    {
      name: "Combined financial resources and need metric",
      value: "needs_met",
      tooltip:
        "This metric combines both a country's JEE scores and the amount of disbursed funds that the country has received. We use JEE scores as a proxy for country-specific needs, and calculate the ratio of financial resources to need. The goal of this metric is to highlight areas whose needs may still be unmet based on their ratio of financial resources to need.",
    },
  ];

  // // Override support type if it doesn't make sense
  // if (
  //   (fundType !== "" && supportType === "jee") ||
  //   (fundType !== "capacity_for_needs_met" && supportType === "needs_met")
  // )
  //   setSupportType("funds");

  // Track main map title
  const [mapTitle, setMapTitle] = React.useState("funds");

  // Track whether to show main menu
  const [showControls, setShowControls] = React.useState(true);

  React.useEffect(() => {
    if (supportTypeDefault !== undefined && supportTypeDefault !== null)
      setSupportType(supportTypeDefault);
  }, [supportTypeDefault]);

  /**
   * Given the transaction type and the support type, returns the flow type.
   * @method getFlowTypeFromArgs
   * @param  {[type]}            transactionType [description]
   * @param  {[type]}            supportType     [description]
   * @return {[type]}                            [description]
   */
  const getFlowTypeFromArgs = ({ transactionType, supportType }) => {
    if (transactionType === "disbursed") {
      switch (supportType) {
        case "inkind":
          return "provided_inkind";
        case "funds":
        default:
          return "disbursed_funds";
      }
    } else if (transactionType === "committed") {
      switch (supportType) {
        case "inkind":
          return "committed_inkind";
        case "funds":
        default:
          return "committed_funds";
      }
    }
  };

  // Get flow type
  const flowType = getFlowTypeFromArgs({
    transactionType: transactionType,
    supportType: supportType,
  });

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo.find(ft => ft.name === flowType)
    .display_name;

  // Get year range to use in title
  const yearRange =
    minYear === maxYear ? minYear.toString() : `${minYear} - ${maxYear}`;
  const transactionTypeDisplay = Util.getInitCap(transactionType) + " funds";
  const getMapTitle = ({ fundType, supportType, entityRole }) => {
    if (supportType === "funds" || supportType === "inkind") {
      const text = {
        role: "",
        fund: "",
        filters: "",
      };

      // Role text
      if (entityRole === "recipient") {
        text.role = "Recipients";
      } else text.role = "Funders";

      // Fund type text
      switch (fundType) {
        case "false":
        case "":
        default:
          break;
        case "true":
          text.fund = " of GHSA funding";
          break;
        case "event":
          text.fund = " of event response funding";
          break;
        case "capacity":
          text.fund = " of IHR capacity building funding";
          break;
      }

      // Filters text
      if (coreCapacities.length > 0) {
        text.filters = ` for selected IHR core capacities (${coreCapacities.join(
          ", "
        )})`;
      } else if (events.length > 0) {
        text.filters = " for selected event responses";
      }

      // Return composite
      return {
        detailed: `${text.role}${text.fund}`,
        subtitle: `${flowTypeDisplayName} (${yearRange})${text.filters}`,
        main: `${text.role}${text.fund} by country`,
      };
    } else if (supportType === "jee") {
      const filterText =
        coreCapacities.length > 0
          ? `; for selected IHR core capacities (${coreCapacities.join(", ")})`
          : "";
      return {
        main: "JEE score by country",
        subtitle: `JEE score data as of May 27, 2020${filterText}`,
      };
    } else if (supportType === "needs_met") {
      const filterText =
        coreCapacities.length > 0
          ? `; for selected IHR core capacities (${coreCapacities.join(", ")})`
          : "";
      return {
        main: "Combined financial resources and need by country",
        subtitle: `JEE score data as of May 27, 2020${filterText}`,
      };
    } else return "[Error] Unknown map metric";
  };

  // Get whether metric has transaction type
  const metricHasTransactionType = ["funds", "inkind"].includes(supportType);

  // Define map menu sections
  const [curTab, setCurTab] = React.useState(
    supportTypeDefault === "jee" ? "scores" : "funding"
  );

  // when map options tab is changed, if the current radio selection for the
  // main data to show on the map is not on this tab, then set a reasonable
  // default (e.g., the first radio option).
  const score_data_names = score_toggle_data.map(d => d.value);
  const combined_data_names = combined_toggle_data.map(d => d.value);
  React.useEffect(() => {
    // Case A: Tabbed to "Funding" and fundType is not defined, so set to
    // 'false' (all).
    if (
      curTab === "funding" &&
      ["", "capacity_for_needs_met"].includes(fundType)
    ) {
      setFundType("false");
      setSupportTypeToSwitchTo("funds");

      // Case B: Tabbed to "Scores" and support type is not a score.
    } else if (curTab === "scores" && !score_data_names.includes(supportType)) {
      setFundType("");
      setSupportTypeToSwitchTo(score_data_names[0]);

      // Case C: Tabbed to "Combined" and and support type is not a combined
      // metric.
    } else if (
      curTab === "combined" &&
      !combined_data_names.includes(supportType)
    ) {
      setFundType("capacity_for_needs_met"); // TODO dynamically
      setEntityRole("recipient");
      setSupportTypeToSwitchTo("needs_met"); // TODO dynamically
    }
  }, [curTab]);

  const filterSelections = fundType !== "event" ? coreCapacities : events;

  const filterSelectionBadges = filterSelections.length > 0 && (
    <div>
      <div className={classNames(styles.sectionTitle, styles.filterBadges)}>
        Filters selected:
      </div>
      <div>
        {fundType !== "event" && (
          <FilterSelections
            {...{
              optionList: core_capacities,
              selections: coreCapacities,
              setSelections: setCoreCapacities,
              type: "coreCapacities",
            }}
          />
        )}
        {fundType === "event" && (
          <FilterSelections
            {...{
              optionList: data.outbreaks,
              selections: events,
              setSelections: setEvents,
              type: "events",
            }}
          />
        )}
      </div>
    </div>
  );

  const filters = (
    <div>
      {fundType === "event" && (
        <FilterDropdown
          {...{
            label: "Event response",
            options: data.outbreaks,
            placeholder: "Select event response",
            onChange: v => setEvents(v.map(d => d.value)),
            curValues: events,
            className: [styles.italic],
            isDark: isDark,
            openDirection: "up",
            setValues: setEvents,
          }}
        />
      )}
      {fundType !== "event" && (
        <FilterDropdown
          {...{
            label: "IHR core capacity",
            options: core_capacities,
            placeholder: "Select core capacities",
            onChange: v => setCoreCapacities(v.map(d => d.value)),
            curValues: coreCapacities,
            className: [styles.italic],
            isDark: isDark,
            openDirection: "up",
            setValues: setCoreCapacities,
          }}
        />
      )}
      {filterSelectionBadges}
    </div>
  );

  const disableRefinements = !["true", "false", "event", "capacity"].includes(
    fundType
  );

  const sections = [
    {
      slug: "funding",
      header: "Funding",
      content: (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <GhsaToggle
              label={""}
              ghsaOnly={fundType}
              setGhsaOnly={setFundType}
            />
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Refine map</div>
            <div className={styles.subSections}>
              <div disabled={disableRefinements} className={styles.subSection}>
                <RadioToggle
                  className={[styles.italic]}
                  label={"Select support type"}
                  callback={setSupportType}
                  curVal={disableRefinements ? "" : supportType}
                  disabled={disableRefinements}
                  choices={[
                    {
                      name: "Financial support",
                      value: "funds",
                    },
                    {
                      name: "In-kind support",
                      value: "inkind",
                      tooltip:
                        "In-kind support is the contribution of goods or services to a recipient. Examples of in-kind support include providing technical expertise or programming support, or supporting GHSA action packages.",
                    },
                  ]}
                />
              </div>
              <div disabled={disableRefinements} className={styles.subSection}>
                <RadioToggle
                  label={"Select funding type"}
                  disabled={disableRefinements}
                  className={[styles.italic]}
                  callback={setTransactionType}
                  curVal={disableRefinements ? "" : transactionType}
                  choices={[
                    {
                      name: "Disbursed",
                      value: "disbursed",
                    },
                    {
                      name: "Committed",
                      value: "committed",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Filter by</div>
            {filters}
          </div>
        </div>
      ),
    },
    {
      slug: "scores",
      header: "Scores",
      content: (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <RadioToggle
              className={[styles.italic]}
              label={""}
              callback={v => {
                setFundType("");
                setSupportTypeToSwitchTo(v);
              }}
              curVal={supportType}
              choices={score_toggle_data}
            />
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Filter by</div>
            {filters}
          </div>
        </div>
      ),
    },
    {
      slug: "combined",
      header: "Combined",
      content: (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <RadioToggle
              label={""}
              callback={v => {
                if (
                  v === "needs_met" &&
                  (entityRole !== "recipient" || fundType !== "capacity")
                ) {
                  if (entityRole !== "recipient") setEntityRole("recipient");
                  if (fundType !== "capacity_for_needs_met")
                    setFundType("capacity_for_needs_met");
                  setSupportTypeToSwitchTo(v);
                } else setSupportType(v);
              }}
              curVal={supportType}
              choices={combined_toggle_data}
            />
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Filter by</div>
            {filters}
          </div>
        </div>
      ),
    },
  ];

  const mapTitleData = getMapTitle({ fundType, supportType, entityRole });
  mapTitleData.entityRoleToggle = supportType !== "needs_met" &&
    supportType !== "jee" && (
      <EntityRoleToggle
        entityRole={entityRole}
        callback={v => {
          setEntityRole(v);
          setSupportTypeToSwitchTo(supportType);
        }}
      />
    );
  mapTitleData.instructions = (
    <div>
      <i>Click country to view details.</i>
    </div>
  );
  setPageHeaderData(mapTitleData);

  return (
    <div className={classNames(styles.mapViewer, { [styles.dark]: isDark })}>
      <div className={styles.header}>
        {
          //   supportType !== "needs_met" && supportType !== "jee" && (
          //   <EntityRoleToggle entityRole={entityRole} callback={setEntityRole} />
          // )
        }
      </div>
      <div className={styles.content}>
        <Map
          supportType={supportType}
          entityRole={entityRole}
          flowType={flowType}
          data={data.nodeSums}
          jeeScores={data.jeeScores}
          minYear={minYear}
          maxYear={maxYear}
          coreCapacities={coreCapacities}
          events={events}
          ghsaOnly={fundType}
          isDark={isDark}
          setLoadingSpinnerOn={setLoadingSpinnerOn}
        />
        <div className={styles.menuContainer}>
          <SlideToggle
            {...{
              label: "controls",
              show: showControls,
              setShow: setShowControls,
            }}
          />
          <div
            style={{ display: showControls ? "" : "none" }}
            className={styles.menu}
          >
            <div>
              <TimeSlider
                disabled={supportType === "jee"}
                minYearDefault={Settings.startYear}
                maxYearDefault={Settings.endYear}
                onAfterChange={years => {
                  setMinYear(years[0]);
                  setMaxYear(years[1]);
                }}
              />
              <div className={styles.tabSectionHeader}>View map by</div>
            </div>
            <div className={styles.tabs}>
              {sections
                .filter(s => s.show !== false)
                .map(s => (
                  <button
                    className={classNames(styles.tabToggle, {
                      [styles.selected]: s.slug === curTab,
                    })}
                    onClick={() => setCurTab(s.slug)}
                  >
                    {s.header}
                  </button>
                ))}
            </div>
            <div className={styles.tabContent}>
              {sections.map(s => (
                <Tab selected={curTab === s.slug} content={s.content} />
              ))}
            </div>
            {
              // TODO: add this tooltip for CC dropdown
              // Core capacities were tagged based on names and descriptions of commitments and disbursements. A single commitment or disbursement may support more than one core capacity. Additional information on how core capacities were tagged can be found on the data definitions page.
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const remountComponent = ({
  component,
  minYear,
  maxYear,
  props,
  id,
  entityRole,
  fundType,
  events,
}) => {
  const remount =
    component.props.minYear !== minYear ||
    component.props.maxYear !== maxYear ||
    component.props.entityRole !== entityRole ||
    component.props.fundType !== fundType ||
    component.props.coreCapacities.toString() !==
      props.coreCapacities.toString() ||
    component.props.events.toString() !== events.toString();
  return remount;
};

export const renderMapViewer = ({
  component,
  setComponent,
  loading,
  id,
  entityRole,
  setEntityRole,
  flowTypeInfo,
  fundType,
  setFundType,
  supportTypeDefault,
  setLoadingSpinnerOn,
  setSupportTypeToSwitchTo,
  events,
  setEvents,
  setPageHeaderData,
  ...props
}) => {
  // Set IDs
  id = parseInt(id);

  if (loading) {
    return <div className={"placeholder"} />;
  } else if (
    component === null ||
    (component &&
      remountComponent({
        component: component,
        props: props,
        id: id,
        entityRole: entityRole,
        fundType: fundType,
        minYear: props.minYear,
        maxYear: props.maxYear,
        events,
      }))
  ) {
    getComponentData({
      setComponent: setComponent,
      id: id,
      flowTypeInfo: flowTypeInfo,
      fundType: fundType,
      setFundType: setFundType,
      entityRole: entityRole,
      setEntityRole: setEntityRole,
      supportTypeDefault,
      setLoadingSpinnerOn,
      setSupportTypeToSwitchTo,
      events,
      setEvents,
      setPageHeaderData,
      ...props,
    });

    return component ? component : <div className={"placeholder"} />;
  } else if (component.props.isDark !== props.isDark) {
    setComponent(
      <MapViewer {...{ ...component.props, isDark: props.isDark }} />
    );
  } else {
    return component;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for response funding page
 * @method getComponentData
 * @param  {[type]}       setComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityRole          [description]
 */
const getComponentData = async ({
  setComponent,
  id,
  entityRole,
  setEntityRole,
  flowTypeInfo,
  fundType,
  setFundType,
  setLoadingSpinnerOn,
  setSupportTypeToSwitchTo,
  setPageHeaderData,
  ...props
}) => {
  // Define typical base query parameters used in FlowQuery,
  // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
  // modified in code below.
  const nodeType = entityRole === "recipient" ? "target" : "source";
  const baseQueryParams = {
    focus_node_ids: null,
    focus_node_type: nodeType,
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${props.minYear}-01-01`, // TODO check these two
    end_date: `${props.maxYear}-12-31`,
    by_neighbor: false,
    filters: { parent_flow_info_filters: [] },
    summaries: {},
    include_master_summary: false,
    // node_category: ["country"]
    // by_node_categories: ["country", "organization"]
  };

  // If core capacity filters provided, use those
  if (props.coreCapacities.length > 0) {
    baseQueryParams.filters.parent_flow_info_filters.push(
      ["core_capacities"].concat(props.coreCapacities)
    );
  }

  // If outbreak response filters provided, use those
  // TODO
  if (props.outbreakResponses && props.outbreakResponses.length > 0) {
    baseQueryParams.filters.parent_flow_info_filters.push(
      ["outbreak_responses"].concat(props.outbreakResponses)
    );
  }

  // If GHSA page, then filter by GHSA projects.
  if (fundType === "true") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "ghsa_funding",
      "True",
    ]);
  } else if (fundType === "event") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "outbreak_id:not",
      null,
    ]);
  } else if (fundType === "capacity" || fundType === "capacity_for_needs_met") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "response_or_capacity:not",
      "response",
    ]);
  }

  // Flow info filters
  const flowInfoFilters = [["events", "outbreak_id"]];
  flowInfoFilters.forEach(type => {
    if (props[type[0]].length > 0) {
      baseQueryParams.filters.parent_flow_info_filters.push(
        [type[1]].concat(props[type[0]])
      );
    }
  });

  // Define queries for typical details page.
  const queries = {
    // Information about the entity
    nodeSums: NodeSums({
      format: "map",
      direction: entityRole === "recipient" ? "target" : "origin",
      filters: {
        "Stakeholder.cat": ["country", "government"],
      },
    }),
    jeeScores: Assessment({
      scoreType: "JEE v1",
    }),
    outbreaks: Outbreak({}),
  };

  // Get query results.
  setLoadingSpinnerOn(true);
  const results = await execute({ queries });
  console.log(results);

  // Feed results and other data to the details component and mount it.
  setComponent(
    <MapViewer
      id={id}
      isDark={props.isDark}
      entityRole={entityRole}
      setEntityRole={setEntityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      fundType={fundType}
      setFundType={setFundType}
      setComponent={setComponent}
      setLoadingSpinnerOn={setLoadingSpinnerOn}
      activeTab={props.activeTab}
      minYear={props.minYear}
      maxYear={props.maxYear}
      setMinYear={props.setMinYear}
      setMaxYear={props.setMaxYear}
      coreCapacities={props.coreCapacities}
      setCoreCapacities={props.setCoreCapacities}
      events={props.events}
      setEvents={props.setEvents}
      supportTypeDefault={props.supportTypeDefault}
      setSupportTypeToSwitchTo={setSupportTypeToSwitchTo}
      setPageHeaderData={setPageHeaderData}
    />
  );
};

export default MapViewer;
