import React, { useEffect, useState, useCallback } from "react"
import ReactTooltip from "react-tooltip"
import classNames from "classnames"
import styles from "./fundersandrecipients.module.scss"
import tooltipStyles from "../../../../common/tooltip.module.scss"
import GhsaToggle from "../../../../misc/GhsaToggle.js"
import RadioToggle from "../../../../misc/RadioToggle.js"
import { Settings } from "../../../../../App.js"
import Util from "../../../../misc/Util.js"
import TimeSlider from "../../../../misc/TimeSlider.js"
import TableInstance from "../../../../chart/table/TableInstance.js"
import { core_capacities, getInfoBoxData } from "../../../../misc/Data.js"
import FilterDropdown from "../../../../common/FilterDropdown/FilterDropdown.js"
import FilterSelections from "../../../../common/FilterSelections/FilterSelections.js"
import Loading from "../../../../common/Loading/Loading"
import Chevron from "../../../../common/Chevron/Chevron.js"
import Drawer from "../../../../common/Drawer/Drawer.js"
import { greens, purples } from "../../../../map/MapUtil.js"
import {
  execute,
  NodeSums,
  FlowType,
  Outbreak,
  Stakeholder,
} from "../../../../misc/Queries"
import { getNodeLinkList } from "../../../../misc/Data.js"
import SourceText from "../../../../common/SourceText/SourceText.js"
import InfoBox from "../../../../map/InfoBox.js"
import { Flag } from "./Flag"

// FC for Orgs.
/**
 * Render tables of stakeholders and the amount of assistance they
 * have provided or received.
 *
 * @param {*} {
 *   data,
 *   entityRole,
 *   setEntityRole,
 *   ghsaOnly,
 *   setGhsaOnly,
 *   flowTypeInfo,
 *   ...props
 * }
 * @return {*}
 */
const FundersAndRecipients = ({
  data,
  entityRole,
  setEntityRole,
  ghsaOnly,
  setGhsaOnly,
  flowTypeInfo,
  ...props
}) => {
  // Track transaction type selected
  // committed or disbursed
  const [transactionType, setTransactionType] = useState("committed")

  // Track support type selected
  // inkind or financial
  const [supportType] = useState("funds")

  // Track main data
  const [loaded, setLoaded] = useState(false)
  const [didFirstLoad, setDidFirstLoad] = useState(false)
  const [tooltipData, setTooltipData] = useState(undefined)
  const [revealed, setRevealed] = useState(false)
  const [tooltipNodeData, setTooltipNodeData] = useState(undefined)
  const [, setHoveredEntity] = useState(undefined)
  const [outbreaks, setOutbreaks] = useState([])
  const [minYear, setMinYear] = useState(Settings.startYear)
  const [maxYear, setMaxYear] = useState(Settings.endYear)
  const [coreCapacities, setCoreCapacities] = useState([])
  const [events, setEvents] = useState([]) // selected event ids
  const [stakeholders, setStakeholders] = useState({})
  const [nodeSumsOrigin, setNodeSumsOrigin] = useState([])
  const [nodeSumsTarget, setNodeSumsTarget] = useState([])
  const [stakeholderCats, setStakeholderCats] = useState("all")

  // FUNCTIONS //
  /**
   * Set correct `cat` field filters based on currently selected
   * stakeholder category
   *
   * @param {*} { stakeholderCats, filters }
   */
  const setFiltersFromCats = ({ stakeholderCats, filters }) => {
    switch (stakeholderCats) {
      case "all":
      default:
        filters["Stakeholder.cat"] = undefined
        return
      case "governments":
        filters["Stakeholder.cat"] = ["government"]
        return
      case "organizations":
        filters["Stakeholder.cat"] = ["organization"]
        return
    }
  }

  /**
   * Returns noun to use as suffix for "funders" and "recipients"
   * based on currently selected stakeholder category
   *
   * @param {*} { stakeholderCats }
   * @return {*}
   */
  const getNounFromCats = ({ stakeholderCats }) => {
    if (stakeholderCats === "all") return ""
    else return stakeholderCats
  }
  const getData = useCallback(async () => {
    const nodeSumsFilters = {
      "Stakeholder.subcat": [["neq", ["sub-organization", "agency"]]],
      "Stakeholder.slug": [["neq", ["not-reported"]]],
      "Flow.year": [["gt_eq", minYear], ["lt_eq", maxYear]],
    }
    setFiltersFromCats({ stakeholderCats, filters: nodeSumsFilters })

    // add assistance type filter
    if (ghsaOnly === "true") {
      nodeSumsFilters["Flow.is_ghsa"] = [true]
    } else if (ghsaOnly === "event") {
      nodeSumsFilters["Flow.response_or_capacity"] = ["response"]
    } else if (ghsaOnly === "capacity") {
      nodeSumsFilters["Flow.response_or_capacity"] = ["capacity"]
    }

    // add outbreak events filters
    if (events.length > 0) {
      nodeSumsFilters["Event.id"] = events
    }
    if (coreCapacities.length > 0) {
      nodeSumsFilters["Core_Capacity.name"] = coreCapacities
    }

    const queries = {
      nodeSumsOrigin: NodeSums({
        direction: "origin",
        filters: nodeSumsFilters,
      }),
      nodeSumsTarget: NodeSums({
        direction: "target",
        filters: nodeSumsFilters,
      }),
      flowTypeInfo: FlowType({}),
      outbreaks: Outbreak({}),
      stakeholders: Stakeholder({ by: "id" }),
    }

    // Get query results.
    const results = await execute({ queries })
    setOutbreaks(results.outbreaks)
    setStakeholders(results.stakeholders)
    setNodeSumsOrigin(results.nodeSumsOrigin)
    setNodeSumsTarget(results.nodeSumsTarget)
    setLoaded(true)
    setDidFirstLoad(true)
  }, [ghsaOnly, minYear, maxYear, coreCapacities, events, stakeholderCats])

  // CONSTANTS //
  const titleSuffix = getNounFromCats({ stakeholderCats })
  const title =
    titleSuffix !== ""
      ? `Funders and recipients (${titleSuffix})`
      : "Funders and recipients"

  // Define filter content
  const outbreakOptions = outbreaks.map(d => {
    return { value: d.id, label: d.name }
  })
  const filterSelections = ghsaOnly !== "event" ? coreCapacities : events

  const filterSelectionBadges = filterSelections.length > 0 && (
    <div>
      <div className={classNames(styles.sectionTitle, styles.filterBadges)}>
        Filters selected:
      </div>
      <div>
        {ghsaOnly !== "event" && (
          <FilterSelections
            {...{
              optionList: core_capacities,
              selections: coreCapacities,
              setSelections: setCoreCapacities,
              type: "coreCapacities",
            }}
          />
        )}
        {ghsaOnly === "event" && (
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
    <div className={styles.filterContainer}>
      {ghsaOnly === "event" && (
        <FilterDropdown
          {...{
            label: "Select PHEICs",
            options: outbreakOptions,
            placeholder: "Select PHEIC",
            onChange: v => setEvents(v.map(d => d.value)),
            curValues: events,
            className: [styles.italic],
            isDark: false,
            openDirection: "down",
            setValues: setEvents,
          }}
        />
      )}
      {ghsaOnly !== "event" && (
        <FilterDropdown
          {...{
            label: "Select IHR core capacities",
            options: core_capacities,
            placeholder: "Select core capacities",
            onChange: v => setCoreCapacities(v.map(d => d.value)),
            curValues: coreCapacities,
            className: [styles.italic],
            isDark: false,
            openDirection: "down",
            setValues: setCoreCapacities,
          }}
        />
      )}
      {filterSelectionBadges}
    </div>
  )

  const yearRange =
    minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`

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

  // Get in-kind support version of flow type
  const inKindFlowType =
    flowType === "disbursed_funds" ? "provided_inkind" : "committed_inkind"

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo.find(ft => ft.name === flowType)
    .display_name

  const inKindFlowTypeDisplayName = [
    flowTypeInfo
      .find(ft => ft.name === inKindFlowType)
      .display_name.split(" ")[0],
    <br />,
    " in-kind support",
  ]

  // Get whether metric has transaction type
  const metricHasTransactionType = ["funds", "inkind"].includes(supportType)

  // Get top funder table and top recipient table
  const tableInstances = []

  const tables = [
    [
      <div className={styles.subtitle}>
        <div className={"flexrow"}>
          <Chevron type={"funder"} />
          <div>
            Top funders ({titleSuffix !== "" ? `${titleSuffix}, ` : ""}
            {yearRange})
          </div>
        </div>
      </div>,
      "Funder",
      "origin",
      nodeSumsOrigin,
    ],
    [
      <div className={styles.subtitle}>
        <div className={"flexrow"}>
          <Chevron type={"recipient"} />
          <div>
            Top recipients ({titleSuffix !== "" ? `${titleSuffix}, ` : ""}
            {yearRange})
          </div>
        </div>
      </div>,
      "Recipient",
      "target",
      nodeSumsTarget,
    ],
  ]

  tables.forEach(([subtitleJsx, role, roleSlug, data]) => {
    const orgTableData = []
    const flagAndNameByOrgId = {}
    for (const [k, v] of Object.entries(data)) {
      if (v[flowType] !== undefined || v[inKindFlowType] !== undefined) {
        const stakeholderInfo = stakeholders[k]
        const showFlag = stakeholderCats !== "organizations"
        flagAndNameByOrgId[stakeholderInfo.id.toString()] = getFlagAndName(
          showFlag,
          stakeholderInfo,
          role,
        )
        orgTableData.push({
          valueRaw: v[flowType],
          value: v[flowType],
          valueInkind: v[inKindFlowType],
          shID: k,
          stakeholderName: stakeholderInfo.name,
        })
      }
    }
    const updateTooltipData = ({ d, nodeType, data, mapData }) => {
      const datum = data[d.id]

      // Get tooltip data on hover
      const tooltipData =
        d !== undefined
          ? getInfoBoxData({
              nodeDataToCheck: d,
              mapData,
              datum,
              supportType,
              jeeScores: [],
              coreCapacities: [],
              colorScale: () => {
                if (nodeType === "origin") return greens[greens.length - 1]
                else return purples[purples.length - 1]
              },
              entityRole: nodeType === "origin" ? "funder" : "recipient",
              minYear,
              maxYear,
              flowType,
              simple: false,
            })
          : undefined
      if (tooltipData && tooltipData.colorValue === undefined)
        tooltipData.colorValue = 1
      setHoveredEntity(d.id)
      setTooltipNodeData(d)
      setTooltipData(tooltipData)
    }

    const tableColumns = [
      {
        title: role,
        prop: roleSlug,
        type: "text",
        width: "40%",
        func: d => d.stakeholderName,
        render: (v, d) => {
          const flagAndName = flagAndNameByOrgId[d.shID]
          return flagAndName
        },
      },
      {
        title: getFlowTypeTitleForTable(flowTypeDisplayName),
        prop: "value",
        type: "num",
        className: d => (d > 0 ? "num" : "num-with-text"),
        func: d => d.valueRaw,
        render: d => Util.formatValue(d, flowType),
      },
      {
        title: <span data-type="num">{inKindFlowTypeDisplayName}</span>,
        prop: "valueInkind",
        type: "num",
        className: d => (d > 0 ? "num" : "num-with-text"),
        func: d => d.valueInkind,
        render: d => Util.formatValue(d, inKindFlowType),
      },
      {
        title: "Stakeholder slug (for data binding)",
        prop: "shID",
        type: "text",
        hide: true,
      },
      {
        title: "Stakeholder name (for searching)",
        prop: "stakeholderName",
        type: "text",
        hide: true,
      },
    ]
    tableInstances.push(
      <div>
        <h2>{subtitleJsx}</h2>
        <TableInstance
          updateVar={[data, supportType, transactionType]}
          key={roleSlug}
          tooltipFunc={function(d) {
            return {
              "data-tip": "",
              "data-for": "orgTooltip",
              onMouseEnter: () => {
                updateTooltipData({
                  d: stakeholders[d.shID],
                  nodeType: roleSlug,
                  data,
                  mapData: [d],
                })
                ReactTooltip.rebuild()
              },
            }
          }}
          paging={true}
          tableColumns={tableColumns}
          tableData={orgTableData}
          sortByProp={"value"}
          customClassNames={[roleSlug]}
          verticalBorders={false}
        />
      </div>,
    )
  })

  // get data on page render or when options changed
  useEffect(() => {
    if (!loaded) getData()
  }, [getData, loaded])

  // reload data if parameters are changed
  useEffect(() => {
    setLoaded(false)
  }, [stakeholderCats, ghsaOnly, minYear, maxYear, coreCapacities, events])

  // rebind tooltips on page render
  useEffect(ReactTooltip.rebuild, [])

  // JSX //
  return (
    <div className={classNames(styles.orgs, "pageContainer")}>
      {
        // HEADER
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          {
            // MINI LOADING SPINNER
            <Loading
              {...{
                loaded: loaded || !didFirstLoad,
                small: true,
              }}
            />
          }
        </div>
      }
      <Loading
        {...{
          loaded: didFirstLoad,
          align: "center",
          message: "Loading tables",
        }}
      >
        {
          // SUBTITLE and INSTRUCTIONS
          <>
            <p className={styles.introduction}>
              The tables below list funders and recipients ordered by the amount
              of assistance they contribute or receive. Click on any stakeholder
              name in the tables for additional detail on their funding. Use the
              filters in{" "}
              <span>
                Select filters
                <span className={"glyphicon glyphicon-chevron-up"} />
              </span>{" "}
              to change what is shown.
            </p>
            {
              // <div className={styles.instructions}>
              //   Click stakeholder name in table to view details.
              // </div>
            }
          </>
        }
        <Drawer
          {...{
            openDefault: true,
            label: "Select filters",
            contentSections: [
              <div className={styles.menu}>
                <div className={styles.menuContent}>
                  <GhsaToggle
                    label={"Select data"}
                    ghsaOnly={ghsaOnly}
                    setGhsaOnly={setGhsaOnly}
                  />
                  <RadioToggle
                    label={"Select stakeholder category"}
                    callback={setStakeholderCats}
                    curVal={stakeholderCats}
                    choices={[
                      {
                        name: "All stakeholders",
                        value: "all",
                      },
                      {
                        name: "Governments only",
                        value: "governments",
                      },
                      {
                        name: "Organizations only",
                        value: "organizations",
                      },
                    ]}
                  />
                  {
                    // <RadioToggle
                    //   label={"Select support type"}
                    //   callback={setSupportType}
                    //   curVal={supportType}
                    //   choices={[
                    //     {
                    //       name: "Financial support",
                    //       value: "funds",
                    //     },
                    //     {
                    //       name: "In-kind support",
                    //       value: "inkind",
                    //       tooltip:
                    //         "In-kind support is the contribution of goods or services to a recipient. Examples of in-kind support include providing technical expertise or programming support, or supporting GHSA action packages.",
                    //     },
                    //   ]}
                    // />
                  }
                  {metricHasTransactionType && (
                    <RadioToggle
                      label={"Select funding type"}
                      callback={setTransactionType}
                      curVal={transactionType}
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
                  )}
                  {filters}
                  <TimeSlider
                    side={"left"}
                    hide={supportType === "jee"}
                    minYearDefault={Settings.startYear}
                    maxYearDefault={Settings.endYear}
                    onAfterChange={years => {
                      setMinYear(years[0])
                      setMaxYear(years[1])
                    }}
                  />
                </div>
              </div>,
            ],
          }}
        />
        <div className={styles.content}>
          <div className={styles.tables}>{tableInstances.map(d => d)}</div>
          {<SourceText />}
        </div>
        {
          // Tooltip for info tooltip icons.
          <ReactTooltip
            id={"orgTooltip"}
            type="light"
            className={classNames(tooltipStyles.tooltip, tooltipStyles.simple)}
            place="top"
            delayShow={500}
            offset={{ top: 5 }}
            effect="float"
            clickable={true}
            afterShow={function(e) {
              setRevealed(true)
            }}
            afterHide={function(e) {
              setRevealed(false)
            }}
            eventOff={null}
            getContent={() =>
              tooltipData && (
                <InfoBox
                  {...{
                    simple: false,
                    entityRole,
                    supportType,
                    nodeData: tooltipNodeData,
                    infoBoxData: tooltipData,
                    setNodeData: setTooltipNodeData,
                    revealed,
                  }}
                />
              )
            }
          />
        }
      </Loading>
    </div>
  )
}

export default FundersAndRecipients

function getFlagAndName(showFlag, stakeholderInfo, role) {
  return (
    <div
      style={{ gridTemplateColumns: showFlag ? "30px 1fr" : undefined }}
      className={styles.flagAndName}
    >
      <Flag
        {...{
          filename: stakeholderInfo.slug + ".png",
          show: showFlag,
        }}
      />
      {getHyperlinkedName(stakeholderInfo, role)}
    </div>
  )
}

function getFlowTypeTitleForTable(flowTypeDisplayName) {
  const flowTypeDisplayNameArr = flowTypeDisplayName.split(" ")
  const flowTypeTitle = (
    <span data-type="num">
      {[flowTypeDisplayNameArr[0], <br />, flowTypeDisplayNameArr[1]]}
    </span>
  )
  return flowTypeTitle
}

function getHyperlinkedName(stakeholderInfo, role) {
  return getNodeLinkList({
    urlType: "details",
    nodeList: [stakeholderInfo],
    entityRole: role.toLowerCase(),
    id: undefined,
    otherId: undefined,
  })
}
