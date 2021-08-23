import React, { useState, useEffect } from "react"
import classNames from "classnames"
import styles from "./mapviewer.module.scss"
import exploreStyles from "../../explore.module.scss"
import EntityRoleToggle from "../../../../misc/EntityRoleToggle.js"
import GhsaToggle from "../../../../misc/GhsaToggle.js"
import RadioToggle from "../../../../misc/RadioToggle.js"
import { Settings } from "../../../../../App.js"
import { getLastUpdatedDate } from "../../../../misc/Util.js"
import {
  execute,
  NodeSums,
  Assessment,
  Outbreak,
} from "../../../../misc/Queries"
import TimeSlider from "../../../../misc/TimeSlider.js"
import {
  FilterDropdown,
  FilterSelections,
  Loading,
  SlideToggle,
} from "../../../../common"
import Tab from "../../../../misc/Tab.js"
import { core_capacities } from "../../../../misc/Data.js"
import { Toggle } from "react-toggle-component"

// Local content components
import Map from "./content/Map.js"
import { EventFilter } from "../../../../misc/EventFilter/EventFilter"

// FC for MapViewer.
const MapViewer = ({
  // constants
  flowTypeInfo,
  versionData,
  supportTypeDefault,

  // state
  isDark,
  setIsDark,
  setPage,
}) => {
  // CONSTANTS //
  const jeeLastUpdatedDateStr = getLastUpdatedDate({
    versionType: "jee",
    data: versionData,
  })

  // STATE //
  const [nodeSums, setNodeSums] = useState([])
  const [outbreaks, setOutbreaks] = useState([])
  const [jeeScores, setJeeScores] = useState([])
  const [entityRole, setEntityRole] = useState("recipient")
  const [fundType, setFundType] = useState(
    supportTypeDefault !== undefined ? "" : "false",
  )
  const [minYear, setMinYear] = useState(Settings.startYear)
  const [maxYear, setMaxYear] = useState(Settings.endYear)
  const [coreCapacities, setCoreCapacities] = useState([])
  const [events, setEvents] = useState([]) // selected event ids
  const [initialized, setInitialized] = useState(false)
  const [initializedData, setInitializedData] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadedData, setLoadedData] = useState(false)
  const [loadedAux, setLoadedAux] = useState(false)

  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = useState("committed")

  // Track support type selected for the map
  const [supportType, setSupportType] = useState(
    supportTypeDefault || "funds_and_inkind",
  )

  // define score toggle options
  const score_toggle_data = [
    {
      name: "JEE score",
      value: "jee",
      tooltip:
        "The Joint External Evaluation tool (JEE) measures country-specific progress in developing the capacities needed to prevent, detect, and respond to public health threats.",
    },
  ]

  // same for combined toggle options
  const combined_toggle_data = [
    {
      name: "Combined financial resources and need metric",
      value: "needs_met",
      tooltip:
        "This metric combines both a country's JEE scores and the amount of disbursed funds that the country has received. We use JEE scores as a proxy for country-specific needs, and calculate the ratio of financial resources to need. The goal of this metric is to highlight areas whose needs may still be unmet based on their ratio of financial resources to need.",
    },
  ]

  // Track whether to show main menu
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    if (supportTypeDefault !== undefined && supportTypeDefault !== null)
      setSupportType(supportTypeDefault)
  }, [supportTypeDefault])

  // FUNCTIONS //
  const getData = async () => {
    // Define filters for node sums query
    const filters = {
      "Stakeholder.cat": ["country", "government"],
      "Flow.year": [["gt_eq", minYear], ["lt_eq", maxYear]],
    }

    // CCs
    const filterByCCs = coreCapacities.length > 0 && fundType !== "event"
    if (filterByCCs) {
      filters["Core_Capacity.name"] = coreCapacities
    }

    // add assistance type filter
    if (fundType === "true") {
      filters["Flow.is_ghsa"] = [true]
    } else if (fundType === "event") {
      filters["Flow.response_or_capacity"] = ["response"]
      // add outbreak events filters
      const filterByEvents = events !== null && events.length > 0
      if (filterByEvents) {
        filters["Event.id"] = events
      }
    } else if (fundType === "capacity") {
      filters["Flow.response_or_capacity"] = ["capacity"]
    }

    // Define queries for map page.
    const queries = {
      // Information about the entity
      nodeSums: NodeSums({
        format: "map",
        direction: entityRole === "recipient" ? "target" : "origin",
        filters,
      }),
    }

    if (!loadedAux) {
      // Define queries for aux data
      queries["jeeScores"] = Assessment({
        format: "map",
        scoreType: "JEE v1",
      })
      queries["outbreaks"] = Outbreak({})
    }

    // Get query results.
    const results = await execute({ queries })
    setNodeSums(results.nodeSums)
    setLoadedData(true)
    if (!loadedAux) {
      setJeeScores(results.jeeScores)
      setOutbreaks(results.outbreaks)
      setLoadedAux(true)
    }
    if (fundType === "capacity_for_needs_met") setSupportType("needs_met")
  }

  // EFFECT HOOKS //
  // load data for map when needed
  useEffect(() => {
    if (!loadedData) getData()
    // eslint-disable-next-line
  }, [loadedData])

  // when parameters change, refresh the data
  useEffect(() => {
    if (loadedData) setLoadedData(false)
    // eslint-disable-next-line
  }, [minYear, maxYear, events, fundType, coreCapacities, entityRole])

  // when map, data, and aux data loaded, update `initialized` if needed
  useEffect(() => {
    if (loadedData && loadedAux && !initializedData) setInitializedData(true)
    if (loaded && initializedData && !initialized) setInitialized(true)
    // eslint-disable-next-line
  }, [loaded && loadedData, loadedAux])

  // toggle dark mode
  useEffect(() => {
    if (!isDark) setIsDark(true)
    return function restoreLight() {
      setIsDark(false)
      setPage(undefined)
    }
    // eslint-disable-next-line
  }, [])

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
          return "provided_inkind"
        case "funds":
        default:
          return "disbursed_funds"
      }
    } else if (transactionType === "committed") {
      switch (supportType) {
        case "inkind":
          return "committed_inkind"
        case "funds":
        default:
          return "committed_funds"
      }
    }
  }

  // Get flow type
  const flowType = getFlowTypeFromArgs({
    transactionType: transactionType,
    supportType: supportType,
  })

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo
    .find(ft => ft.name === flowType)
    .display_name.replace("projects", "in-kind support")

  // Get year range to use in title
  const yearRange =
    minYear === maxYear ? minYear.toString() : `${minYear} - ${maxYear}`
  const getMapTitle = ({ fundType, supportType, entityRole }) => {
    if (
      supportType === "funds" ||
      supportType === "inkind" ||
      supportType === "funds_and_inkind"
    ) {
      const text = {
        role: "",
        fund: "",
        filters: "",
      }

      // Role text
      if (entityRole === "recipient") {
        text.role = "Recipients"
      } else text.role = "Funders"

      // Fund type text
      switch (fundType) {
        case "false":
        case "":
        default:
          break
        case "true":
          text.fund =
            " of GHSA" + (entityRole === "recipient" ? " funding" : "")
          break
        case "event":
          text.fund =
            " of PHEIC" + (entityRole === "recipient" ? " funding" : "s")
          break
        case "capacity":
          text.fund =
            " of capacity building (IHR)" +
            (entityRole === "recipient" ? " funding" : "")
          break
      }

      // Filters text
      if (coreCapacities.length > 0 && fundType !== "event") {
        text.filters = ` for selected IHR core capacities (${coreCapacities.join(
          ", ",
        )})`
      } else if (events.length > 0 && fundType === "event") {
        text.filters = " for selected PHEICs"
      }

      // Return composite
      let fundsAndInkind =
        supportType === "funds_and_inkind" ? "and in-kind support " : ""
      return {
        detailed: `${text.role}${text.fund}`,
        subtitle: `${flowTypeDisplayName} ${fundsAndInkind}(${yearRange})${
          text.filters
        }`,
        main: `${text.role}${text.fund} by country `,
      }
    } else if (supportType === "jee") {
      const filterText =
        coreCapacities.length > 0
          ? `; for selected IHR core capacities (${coreCapacities.join(", ")})`
          : ""
      return {
        main: "JEE score averages by country",
        subtitle: `JEE score data as of ${jeeLastUpdatedDateStr}${filterText}`,
      }
    } else if (supportType === "needs_met") {
      const filterText =
        coreCapacities.length > 0
          ? `; for selected IHR core capacities (${coreCapacities.join(", ")})`
          : ""
      return {
        main: "Combined financial resources and need by country",
        subtitle: `JEE score data as of May 27, 2020${filterText}`,
      }
      // } else if (supportType === "funds_and_inkind") {
      //   const filterText =
      //     coreCapacities.length > 0
      //       ? `; for selected IHR core capacities (${coreCapacities.join(", ")})`
      //       : "";
      //   return {
      //     main: "Combined financial and in-kind support by country",
      //   };
    } else return "[Error] Unknown map metric"
  }

  // Define map menu sections
  const [curTab, setCurTab] = useState(
    supportTypeDefault === "jee" ? "scores" : "funding",
  )

  // when map options tab is changed, if the current radio selection for the
  // main data to show on the map is not on this tab, then set a reasonable
  // default (e.g., the first radio option).
  const score_data_names = score_toggle_data.map(d => d.value)
  const combined_data_names = combined_toggle_data.map(d => d.value)
  useEffect(() => {
    // Case A: Tabbed to "Funding" and fundType is not defined, so set to
    // 'false' (all).
    if (
      curTab === "funding" &&
      ["", "capacity_for_needs_met"].includes(fundType)
    ) {
      setFundType("false")
      setSupportType("funds_and_inkind")

      // Case B: Tabbed to "Scores" and support type is not a score.
    } else if (curTab === "scores" && !score_data_names.includes(supportType)) {
      setFundType("")
      setSupportType("jee")

      // Case C: Tabbed to "Combined" and and support type is not a combined
      // metric.
    } else if (
      curTab === "combined" &&
      !combined_data_names.includes(supportType)
    ) {
      setEntityRole("recipient")
      setFundType("capacity_for_needs_met") // TODO dynamically
    }
    // eslint-disable-next-line
  }, [curTab])

  const outbreakOptions =
    outbreaks !== null
      ? outbreaks.map(d => {
          return { value: d.id, label: d.name }
        })
      : []

  const filterSelections = fundType !== "event" ? coreCapacities : events

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
              optionList: outbreakOptions,
              selections: events,
              setSelections: setEvents,
              type: "events",
            }}
          />
        )}
      </div>
    </div>
  )

  const filters = (
    <div>
      {fundType === "event" && (
        <EventFilter
          {...{
            outbreakOptions,
            events,
            setEvents,
            isDark,
            openDirection: "up",
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
  )

  const disableRefinements = !["true", "false", "event", "capacity"].includes(
    fundType,
  )

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
                      name: (
                        <>
                          Financial and
                          <br />
                          in-kind support
                        </>
                      ),
                      value: "funds_and_inkind",
                    },
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
                      name: "Committed",
                      value: "committed",
                    },
                    {
                      name: "Disbursed",
                      value: "disbursed",
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
                setFundType("")
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
    // {
    //   slug: "combined",
    //   header: "Combined",
    //   content: (
    //     <div className={styles.tabContent}>
    //       <div className={styles.section}>
    //         <RadioToggle
    //           label={""}
    //           callback={v => {
    //             if (
    //               v === "needs_met" &&
    //               (entityRole !== "recipient" || fundType !== "capacity")
    //             ) {
    //               if (entityRole !== "recipient") setEntityRole("recipient")
    //               if (fundType !== "capacity_for_needs_met")
    //                 setFundType("capacity_for_needs_met")
    //             }
    //             setSupportType(v)
    //           }}
    //           curVal={supportType}
    //           choices={combined_toggle_data}
    //         />
    //       </div>
    //       <div className={styles.section}>
    //         <div className={styles.sectionTitle}>Filter by</div>
    //         {filters}
    //       </div>
    //     </div>
    //   ),
    // },
  ]

  const mapTitleData = getMapTitle({ fundType, supportType, entityRole })
  mapTitleData.entityRoleToggle = supportType !== "needs_met" &&
    supportType !== "jee" && (
      <EntityRoleToggle
        entityRole={entityRole}
        callback={v => {
          setEntityRole(v)
        }}
      />
    )
  mapTitleData.instructions = (
    <div>
      <i>Click country to view details.</i>
    </div>
  )

  // JSX //
  return (
    <div
      className={classNames(
        "pageContainer",
        "wide",
        styles.mapViewer,
        exploreStyles.map,
        {
          [styles.dark]: isDark,
        },
      )}
    >
      {!initialized && (
        <div className={styles.instructions}>
          <i>Loading map</i>
        </div>
      )}
      <Loading {...{ loaded: initialized, align: "center" }}>
        {initializedData && (
          <>
            <div className={exploreStyles.header}>
              <div className={exploreStyles.titles}>
                <div className={exploreStyles.left}>
                  {
                    // main titles and instructions
                  }
                  <div className={exploreStyles.title}>{mapTitleData.main}</div>
                  <span className={styles.subtitle}>
                    {mapTitleData.subtitle}
                  </span>
                </div>
              </div>
              <div className={exploreStyles.controls}>
                <span className={exploreStyles.instructions}>
                  <i>{mapTitleData.instructions}</i>
                </span>
                <div className={exploreStyles.buttons}>
                  <Loading {...{ loaded: loadedData, small: true }} />

                  {// funder / recipient toggle
                  supportType !== "needs_met" && supportType !== "jee" && (
                    <EntityRoleToggle
                      entityRole={entityRole}
                      callback={setEntityRole}
                    />
                  )}
                  <div className={styles.darkToggle}>
                    {
                      // dark mode toggle
                    }
                    <Toggle
                      checked={isDark}
                      knobColor="#ccc"
                      borderWidth="1px"
                      borderColor="#ccc"
                      radius="3px"
                      knobWidth="8px"
                      backgroundColor={isDark ? "#333" : "white"}
                      radiusBackground="2px"
                      knobRadius="2px"
                      width={"55px"}
                      name="toggle-1"
                      onToggle={() => setIsDark(!isDark)}
                    />
                    <div className={classNames({ [styles.dark]: isDark })}>
                      {isDark ? "Dark" : "Light"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.content}>
              <Map
                supportType={supportType}
                entityRole={entityRole}
                flowType={flowType}
                data={nodeSums}
                jeeScores={jeeScores}
                minYear={minYear}
                maxYear={maxYear}
                coreCapacities={coreCapacities}
                events={events}
                ghsaOnly={fundType}
                isDark={isDark}
                loaded={loaded}
                setLoaded={setLoaded}
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
                        setMinYear(years[0])
                        setMaxYear(years[1])
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
          </>
        )}
      </Loading>
    </div>
  )
}

export default MapViewer
