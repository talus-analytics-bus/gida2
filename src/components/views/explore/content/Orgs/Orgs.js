import React, { useEffect, useState, useCallback } from "react"
import ReactTooltip from "react-tooltip"
import classNames from "classnames"
import styles from "./orgs.module.scss"
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
import {
  getMapTooltipLabel,
  getUnknownValueExplanation,
  getMapMetricValue,
  greens,
  purples,
} from "../../../../map/MapUtil.js"
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

// FC for Orgs.
const Orgs = ({
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
  const [supportType, setSupportType] = useState("funds")

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

  // FUNCTIONS //
  const getData = useCallback(async () => {
    const nodeSumsFilters = {
      "Stakeholder.cat": ["organization"],
      "Stakeholder.subcat": [["neq", ["sub-organization"]]],
      "Stakeholder.slug": [["neq", ["not-reported"]]],
      "Flow.year": [["gt_eq", minYear], ["lt_eq", maxYear]],
    }

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
  }, [ghsaOnly, minYear, maxYear, coreCapacities, events])

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
            label: "Select event responses",
            options: outbreakOptions,
            placeholder: "Select event response",
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

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo.find(ft => ft.name === flowType)
    .display_name

  const getMapTitle = ({ supportType, entityRole }) => {
    if (supportType === "funds" || supportType === "inkind") {
      if (entityRole === "recipient") {
        return "Recipients by country"
      } else return "Funders by country"
    } else if (supportType === "jee") {
      return "JEE score by country"
    } else if (supportType === "needs_met") {
      return "Combined financial resources and need metric"
    } else return "[Error] Unknown map metric"
  }

  // Get whether metric has transaction type
  const metricHasTransactionType = ["funds", "inkind"].includes(supportType)

  // Get data for tables and tooltips.
  // Define "columns" for map data.
  const getTableColDefs = (nodeTypeForColDef, entityRoleForColDef) => {
    return [
      {
        title: "Organization",
        prop: nodeTypeForColDef,
        type: "text",
        func: d => JSON.stringify(d[nodeTypeForColDef]),
        render: d =>
          getNodeLinkList({
            urlType: "details",
            nodeList: JSON.parse(d),
            entityRole: entityRoleForColDef,
            id: undefined,
            otherId: undefined,
          }),
      },
      {
        title: "Map metric raw value",
        prop: "value_raw",
        type: "num",
        func: d =>
          getMapMetricValue({
            d,
            supportType,
            flowType,
            coreCapacities,
            forTooltip: false,
          }),
      },
      {
        title: "Map metric display value",
        prop: "value",
        type: "num",
        render: d => Util.formatValue(d, supportType),
        func: d =>
          getMapMetricValue({
            d,
            supportType,
            flowType,
            coreCapacities,
            forTooltip: true,
          }),
      },
      {
        title: "Unknown value explanation (if applicable)",
        prop: "unknown_explanation",
        type: "text",
        render: d => Util.formatValue(d, "text"),
        func: d =>
          getUnknownValueExplanation({
            datum: d,
            value: getMapMetricValue({
              d,
              supportType,
              flowType,
              coreCapacities,
            }),
            entityRole: entityRoleForColDef,
          }),
      },
      {
        title: "Stakeholder ID",
        prop: "shID",
        type: "text",
        render: d => d,
      },
      {
        title: "Stakeholder name",
        prop: "stakeholderName",
        type: "text",
        render: d => d,
      },
      {
        title: "Map tooltip label",
        prop: "tooltip_label",
        type: "text",
        render: d =>
          getMapTooltipLabel({
            val: d,
            supportType,
            flowType,
            minYear,
            maxYear,
            entityRoleForColDef,
          }),
        func: d =>
          getMapMetricValue({
            d,
            supportType,
            flowType,
            coreCapacities,
          }),
      },
    ]
  }

  // // get table data
  // const tableData = [];
  // for (const [k, v] of Object.entries(data.nodeSumsOrigin)) {
  //   tableData.push;
  // }

  // Get top funder table and top recipient table
  const tableInstances = []

  const tables = [
    [
      <div className={styles.subtitle}>
        <div className={"flexrow"}>
          <Chevron type={"funder"} />
          <div>Top organizational funders ({yearRange})</div>
        </div>
        <div class={"normal"}>
          <i>Countries and government agencies not shown</i>
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
          <div>Top organizational recipients ({yearRange})</div>
        </div>
        <div class={"normal"}>
          <i>Countries and government agencies not shown</i>
        </div>
      </div>,
      "Recipient",
      "target",
      nodeSumsTarget,
    ],
  ]
  tables.forEach(([subtitleJsx, role, roleSlug, data]) => {
    const orgTableData = []
    for (const [k, v] of Object.entries(data)) {
      if (v[flowType] !== undefined) {
        const stakeholderInfo = stakeholders[k]
        orgTableData.push({
          [roleSlug]: getNodeLinkList({
            urlType: "details",
            nodeList: [stakeholderInfo],
            entityRole: role.toLowerCase(),
            id: undefined,
            otherId: undefined,
          }),
          value_raw: v[flowType],
          value: v[flowType],
          shID: k,
          stakeholderName: stakeholderInfo.name,
        })
      }
    }

    const tableRowDefs = getTableColDefs(roleSlug, role.toLowerCase()) // target, recipient

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
        func: d => d[roleSlug],
        render: d => d,
      },
      {
        title: flowTypeDisplayName,
        prop: "value",
        type: "num",
        className: d => (d > 0 ? "num" : "num-with-text"),
        func: d => d.value_raw,
        render: d => Util.formatValue(d, flowType),
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
          noNativeSorting={true}
          tableColumns={tableColumns}
          tableData={orgTableData}
          sortByProp={"value"}
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
  }, [ghsaOnly, minYear, maxYear, coreCapacities, events])

  // rebind tooltips on page render
  useEffect(ReactTooltip.rebuild, [])

  // JSX //
  return (
    <div className={classNames(styles.orgs, "pageContainer")}>
      {
        // HEADER
        <div className={styles.header}>
          <div className={styles.title}>Funders and recipients</div>
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
          // SUBTITLE
          <div className={styles.instructions}>
            Click stakeholder name in table to view details.
          </div>
        }
        <Drawer
          {...{
            openDefault: true,
            label: "Options",
            contentSections: [
              <div className={styles.menu}>
                <div className={styles.menuContent}>
                  <GhsaToggle
                    label={"Select data"}
                    ghsaOnly={ghsaOnly}
                    setGhsaOnly={setGhsaOnly}
                  />
                  <RadioToggle
                    label={"Select support type"}
                    callback={setSupportType}
                    curVal={supportType}
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

export default Orgs
