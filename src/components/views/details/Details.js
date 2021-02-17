import React, { useState, useEffect, useLayoutEffect } from "react"
import { Link } from "react-router-dom"
import styles from "./details.module.scss"
import classNames from "classnames"
import { Settings } from "../../../App.js"
import {
  getNodeLinkList,
  getWeightsBySummaryAttributeSimple,
  getSummaryAttributeWeightsByNode,
  isUnknownDataOnly,
  parseIdsAsNames,
} from "../../misc/Data.js"
import Util, { isEmpty } from "../../misc/Util.js"

// queries
import {
  execute,
  Stakeholder,
  Assessment,
  Flow,
  NodeSums,
  Outbreak,
} from "../../misc/Queries"

import { purples, greens, pvsCats, pvsColors } from "../../map/MapUtil.js"

// Content components
import DetailsSection from "../../views/details/content/DetailsSection.js"
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js"
import Donuts from "../../chart/Donuts/Donuts.js"
import StackBar from "../../chart/StackBar/StackBar.js"
import TableInstance from "../../chart/table/TableInstance.js"
import EntityRoleToggle from "../../misc/EntityRoleToggle.js"
import Loading from "../../common/Loading/Loading.js"
import ScoreBlocks from "../../common/ScoreBlocks/ScoreBlocks.js"
import Tab from "../../misc/Tab.js"
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js"
import ReactTooltip from "react-tooltip"
import tooltipStyles from "../../common/tooltip.module.scss"
import TopTable from "../../chart/TopTable/TopTable"

// local components
import EventTable from "./content/EventTable"

// FC for Details.
const Details = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  setComponent,
  setLoadingSpinnerOn,
  ...props
}) => {
  const direction = entityRole === "funder" ? "origin" : "target"
  const otherDirection = direction === "origin" ? "target" : "origin"

  let pageType
  if (id.toString().toLowerCase() === "ghsa") pageType = "ghsa"
  else pageType = "entity"

  // If entity role is not defined, let it be funder as a placeholder.
  if (entityRole === undefined) entityRole = "funder"

  // Define noun for entity role
  const entityRoleNoun = Util.getRoleTerm({ type: "noun", role: entityRole })

  // Define other entity role, which is used in certain charts
  const otherEntityRole = entityRole === "funder" ? "recipient" : "funder"

  // Define the other node type based on the current entity role, which is used
  // in certain charts.
  const nodeType = entityRole === "funder" ? "origin" : "target"
  const otherNodeType = entityRole === "funder" ? "target" : "origin"

  // Track whether viewing committed or disbursed/provided assistance
  const [curFlowType, setCurFlowType] = useState("committed_funds")
  const [pvsTooltipData, setPvsTooltipData] = useState(undefined)

  // is there any data to show? Inkind only?
  const [noData, setNoData] = useState(false)
  const [inkindOnly, setInkindOnly] = useState(false)

  // track flows used to calc. total event funding
  const [eventTotalsData, setEventTotalsData] = useState(null)

  // is there any event funding?
  const noEventFunding =
    eventTotalsData === null || eventTotalsData.length === 0

  const [nodeData, setNodeData] = useState({})
  const [nodesData, setNodesData] = useState({})
  const defaultPvs = { eds: [], data: [], loading: true }
  const [pvs, setPvs] = useState(defaultPvs)
  const [dataLoaded, setDataLoaded] = useState(false)

  const getData = async () => {
    // define directions for queries
    const direction = entityRole === "funder" ? "origin" : "target"
    const otherDirection = direction === "origin" ? "target" : "origin"

    // define common filters for most queries
    const commonFilters = {}

    // if GHSA page, filter by `is_ghsa === true`
    const isGhsaPage = id === "ghsa"
    if (isGhsaPage) {
      commonFilters["Flow.is_ghsa"] = [true]
    }

    const queries = {
      // Information about the entity
      nodesData: Stakeholder({ by: "id" }),
    }

    if (!isGhsaPage)
      queries.pvs = Assessment({
        id,
        scoreType: "PVS",
      })

    // Get query results.
    // setLoadingSpinnerOn(true);
    const results = await execute({ queries })

    // use first and only node result
    if (!isGhsaPage) results.nodeData = results.nodesData[id]
    else results.nodeData = { id: -9999, name: "GHSA" }

    setNodeData(results.nodeData)
    setNodesData(results.nodesData)
    if (!isGhsaPage) setPvs(results.pvs)
    else setPvs({ ...defaultPvs, loading: false })
  }

  const [curTab, setCurTab] = useState("ihr")
  const [showFlag, setShowFlag] = useState(nodeData.subcat === "country")
  const [curPvsEdition, setCurPvsEdition] = useState(pvs.eds[0] || {})

  // Get display name for current flow type
  const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
    .display_name

  // True if there are no data to show for the entire page, false otherwise.
  const noFinancialData = false

  // True if the only available data to show are for "unknown" values (specific
  // value no reported).
  // TODO make work with new API
  const unknownDataOnly = false

  // Define header charts
  const pageHeaderContent = {
    header: null,
    content: (
      <FundsByYear
        id={id}
        entityRole={entityRole}
        otherEntityRole={otherEntityRole}
        unknownDataOnly={unknownDataOnly}
        noFinancialData={noFinancialData}
        flowTypeInfo={flowTypeInfo}
        ghsaOnly={ghsaOnly}
        setLoadingSpinnerOn={setLoadingSpinnerOn}
        setNoData={setNoData}
        setInkindOnly={setInkindOnly}
        header={
          <h2>
            Total funds{" "}
            {Util.getRoleTerm({ type: "adjective", role: entityRole })} from{" "}
            {Settings.startYear} to {Settings.endYear}
          </h2>
        }
      />
    ),
    toggleFlowType: false,
    // hide: noData,
  }

  // Define details content sections.
  const showTabs = true
  // const showTabs = !noData && !unknownDataOnly && !noFinancialData;

  // For PHEIC funding: get totals.
  // TODO move into EventTable
  const eventResponseTotals = (
    <div className={styles.totals}>
      <TotalByFlowType
        key={"c"}
        inline={true}
        flowType="committed_funds"
        data={eventTotalsData}
        label={"PHEIC funding"}
      />
      <TotalByFlowType
        key={"d"}
        inline={true}
        flowType="disbursed_funds"
        data={eventTotalsData}
        label={"PHEIC funding"}
      />
    </div>
  )

  const pvsLegend = (
    <div className={styles.legend}>
      <b>Fundamental components</b>
      <div>
        {pvsCats.map((d, i) => (
          <div>
            <div
              style={{ backgroundColor: pvsCats[i][1] }}
              className={styles.circle}
            >
              {Util.roman(i + 1)}
            </div>
            <div>{pvsCats[i][0]}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const updatePvsTooltipData = d => {
    const allEdVals = pvs.data.filter(
      dd => dd.ind.toLowerCase() === d.indName.toLowerCase(),
    )

    const indNum = d.indId.split(" ")[0].split("-")[1]
    const tooltipData = {
      title: (
        <div>
          <div
            style={{ backgroundColor: pvsCats[d.cat - 1][1] }}
            className={styles.circle}
          >
            {Util.roman(d.cat)}
          </div>
          <div>{d.indId + " " + d.indName}</div>
        </div>
      ),
      cols: ["Edition number", "Score"],
      rows: allEdVals.map((dd, ii) => {
        return [dd.ed, dd.score]
      }),
    }
    setPvsTooltipData(tooltipData)
  }
  // tooltipFunc={d => {
  //   return {
  //     "data-tip": "",
  //     "data-for": "pvsTooltip",
  //     onMouseOver: () => updatePvsTooltipData(d)
  //   };
  // }}
  const pvsTabContent = [
    {
      header: (
        <div className={styles.header}>
          <div>
            <h2>
              PVS Evaluation scores <br />
            </h2>
            <div className={styles.select}>
              <b>OIE PVS score edition</b>
              <form>
                <select
                  onChange={v =>
                    setCurPvsEdition(pvs.eds.find(d => d.ed === v.target.value))
                  }
                >
                  {[...new Set(pvs.eds.map(d => d.ed))].map(d => (
                    <option value={d}>{d}</option>
                  ))}
                </select>
              </form>
            </div>
            {curPvsEdition.date !== undefined &&
              curPvsEdition.date !== null &&
              curPvsEdition.date !== "NaN" && (
                <p className={styles.subText}>
                  Evaluation conducted in {curPvsEdition.date}
                </p>
              )}
          </div>
          {pvsLegend}
        </div>
      ),
      text: undefined,
      content: (
        <div>
          <TableInstance
            pageLength={20}
            paging={true}
            sortByProp={"cat"}
            tableColumns={[
              {
                title: "Fundamental component",
                prop: "cat",
                type: "text",
                func: d => d.cat,
                width: 120,
                render: d => (
                  <div
                    style={{ backgroundColor: pvsCats[d - 1][1] }}
                    className={styles.circle}
                  >
                    {Util.roman(d)}
                  </div>
                ),
              },
              {
                title: "Indicator ID",
                prop: "indId",
                type: "text",
                func: d => d.indId,
                render: d => d,
                hide: true,
              },
              {
                title: "Indicator name (only)",
                prop: "indName",
                type: "text",
                func: d => d.ind,
                render: d => d,
                hide: true,
              },
              {
                title: "Core competency",
                prop: "ind",
                type: "text",
                func: d => d.indId + " " + d.ind,
                render: d => d,
              },
              {
                title: "Level of advancement (1 to 5)",
                prop: "score",
                type: "text",
                func: d => (d.score === "N/A" ? -9999 : d.score),
                width: 240,
                render: d => (
                  <ScoreBlocks
                    {...{
                      value: d,
                      rangeArray: [1, 2, 3, 4, 5],
                      colors: pvsColors,
                    }}
                  />
                ),
              },
            ]}
            tableData={pvs.data.filter(d => d.ed === curPvsEdition.ed)}
            sortOrder={"ascending"}
            hide={r => r.amount === -9999}
          />
        </div>
      ),
      toggleFlowType: false,
      // hide: noData || unknownDataOnly || noFinancialData,
    },
  ]

  // constants
  const havePvs = pvs.data.length !== 0 && entityRole !== "funder"
  const haveAssistance = noData !== null ? !noData && !inkindOnly : true
  const haveEvent =
    eventTotalsData !== null ? eventTotalsData.length !== 0 : false
  const haveAny = havePvs || haveAssistance || haveEvent

  const tabSections = showTabs
    ? [
        {
          slug: "ihr",
          header: "IHR funding",
          hide: noData || inkindOnly,
          noData: noData || inkindOnly,
          content: [
            {
              header: <h2>Funding by core capacity</h2>,
              text: (
                <p>
                  The chart below shows the funds{" "}
                  {Util.getRoleTerm({
                    type: "adjective",
                    role: entityRole,
                  })}{" "}
                  by core capacity. Only funded core capacities are shown. Hover
                  over a bar to see additional funding details.
                </p>
              ),
              content: (
                <StackBar
                  staticStakeholders={props.nodesData}
                  flowType={curFlowType}
                  flowTypeName={curFlowTypeName}
                  attributeType={"core_capacities"}
                  nodeType={nodeType}
                  otherNodeType={otherNodeType}
                  placeType={nodeData.subcat}
                  id={id}
                  ghsaOnly={ghsaOnly}
                  render={curTab === "ihr"}
                  otherDirection={otherDirection}
                />
              ),
              toggleFlowType: true,
              hide: noData || unknownDataOnly || noFinancialData,
            },
            {
              header: <h2>Top {otherEntityRole}s</h2>,
              text: (
                <p>
                  The table below displays {otherEntityRole}s in order of amount
                  of funds{" "}
                  {Util.getRoleTerm({
                    type: "adjective",
                    role: otherEntityRole,
                  })}
                  . Click on a{" "}
                  {Util.getRoleTerm({
                    type: "noun",
                    role: otherEntityRole,
                  })}{" "}
                  name to view their profile.
                </p>
              ),
              content: (
                <TopTable
                  {...{
                    id,
                    curFlowType,
                    otherEntityRole,
                    otherNodeType: otherDirection,
                    direction: otherDirection,
                    staticStakeholders: nodesData,
                  }}
                />
              ),
              toggleFlowType: true,
              hide: noData || noFinancialData,
            },
            {
              header: <h2>Top {entityRole}s</h2>,
              content: pageType === "ghsa" && (
                <TopTable
                  {...{
                    id,
                    curFlowType,
                    otherEntityRole: entityRole,
                    otherNodeType: direction,
                    direction: direction,
                    staticStakeholders: nodesData,
                  }}
                />
              ),
              toggleFlowType: true,
              hide: noData || pageType !== "ghsa" || noFinancialData,
            },
          ],
        },
        {
          slug: "event",
          header: "PHEIC funding",
          hide:
            noData ||
            (eventTotalsData !== null && eventTotalsData.length === 0),
          invis: eventTotalsData === null, // not yet loaded
          content: [
            {
              header: (
                <div>
                  <h2>
                    Recent PHEIC funding projects <br />
                    {
                      // Time frame
                      // <span>in past 12 months</span>
                    }
                    {
                      // // Date range
                      // <span className={styles.timeFrame}>
                      //   {props.responseStart.toLocaleString("en-us", {
                      //     // month: "short",
                      //     // day: "numeric",
                      //     year: "numeric",
                      //     timeZone: "UTC",
                      //   })}{" "}
                      //   -{" "}
                      //   {props.responseEnd.toLocaleString("en-us", {
                      //     // month: "short",
                      //     // day: "numeric",
                      //     year: "numeric",
                      //     timeZone: "UTC",
                      //   })}
                      // </span>
                    }
                  </h2>
                </div>
              ),
              text: (
                <div>
                  <p>
                    This tab shows recent PHEIC funding projects where{" "}
                    {nodeData.name} or an associated region/group was a{" "}
                    {entityRole}. Note that all values listed here may not apply
                    specifically to {nodeData.name}.
                  </p>
                  {eventResponseTotals}
                </div>
              ),
              content: (
                <div>
                  <EventTable
                    {...{
                      id,
                      direction,
                      otherDirection,
                      entityRole,
                      otherEntityRole,
                      curFlowType,
                      curFlowTypeName,
                      setEventTotalsData, // set flows to var. for totals
                      isGhsaPage: id === "ghsa",
                      sortByProp: "amount",
                    }}
                  />
                </div>
              ),
              toggleFlowType: true,
              hide: noData || noFinancialData,
            },
          ],
        },
        {
          slug: "pvs",
          header: "PVS scores",
          content: pvsTabContent,
          hide: pvs.data.length === 0 || entityRole === "funder",
          noData: pvs.data.length === 0 || entityRole === "funder",
          invis: pvs.loading, // not yet loaded
        },
      ]
    : []

  const flagId = nodeData.slug ? nodeData.slug : "unspecified"

  const ghsa = pageType === "ghsa"

  const flagSrc = ghsa
    ? `/flags/ghsa.png`
    : `https://flags.talusanalytics.com/1000px/${flagId}.png`
  // : `https://www.countryflags.io/${flagId}/flat/64.png`;
  const flag =
    !isEmpty(nodeData) && (showFlag || ghsa) ? (
      <img
        key={flagId}
        onError={e => addDefaultSrc(e)}
        className={classNames({ [styles.small]: ghsa })}
        src={flagSrc}
      />
    ) : null

  // https://medium.com/@webcore1/react-fallback-for-broken-images-strategy-a8dfa9c1be1e
  const addDefaultSrc = ev => {
    ev.target.src = "/flags/unspecified.png"
    setShowFlag(false)
  }

  // update all data when `id` changes
  useEffect(() => {
    setShowFlag(true)
    setPvs(defaultPvs)
    setEventTotalsData(null)
    setCurPvsEdition(pvs.eds[0] || {})

    window.scrollTo(0, 0) // TODO check
    setDataLoaded(false)

    // reset data when ID changes
    setEventTotalsData(null)
  }, [id])

  // update pvs edition
  useEffect(() => {
    setCurPvsEdition(pvs.eds[0] || {})
  }, [pvs])

  useEffect(() => {
    ReactTooltip.rebuild()
  }, [curPvsEdition])

  // update initial tab if IHR data not avail.
  useEffect(() => {
    if (noData !== null && eventTotalsData !== null) {
      if (!haveAssistance) {
        if (haveEvent) setCurTab("event")
        else if (havePvs) setCurTab("pvs")
        else setCurTab(null)
      } else setCurTab("ihr")
    } else setCurTab("ihr")
  }, [noData, inkindOnly, pvs, eventTotalsData, entityRole, id])

  useEffect(() => {
    // setCurTab("ihr");
    setDataLoaded(false)
    // reset data when role changes
    setEventTotalsData(null)
  }, [entityRole])

  // if no PHEIC data then set current tab to IHR
  useEffect(() => {
    if (eventTotalsData !== null && eventTotalsData.length === 0)
      setCurTab("ihr")
  }, [eventTotalsData])

  useLayoutEffect(() => {
    if (!dataLoaded) getData()
  }, [id, dataLoaded])

  // when node data are updated, update flag show/hide
  useLayoutEffect(() => {
    if (!isEmpty(nodeData)) {
      setShowFlag(ghsa || nodeData.subcat === "country")
    }
  }, [nodeData])

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.details)}>
      <div className={styles.header}>
        {!ghsa && (
          <div
            style={{
              backgroundColor:
                entityRole === "funder" ? "rgb(56, 68, 52)" : "rgb(68, 0, 66)",
            }}
            className={styles.entityRole}
          >
            <div>{entityRoleNoun} profile</div>
          </div>
        )}
        <div className={styles.countryBanner}>
          <div className={styles.bannerRow}>
            <div className={styles.countryName}>
              {showFlag && flag && flag}
              <h1>{nodeData.name}</h1>
            </div>
            {!ghsa && (
              <EntityRoleToggle
                entityRole={entityRole}
                redirectUrlFunc={v => `/details/${id}/${v}`}
              />
            )}
          </div>
        </div>
      </div>
      <div>
        {[pageHeaderContent].map(
          s =>
            !s.hide && (
              <DetailsSection
                header={s.header}
                content={s.content}
                text={s.text}
                curFlowType={curFlowType}
                setCurFlowType={setCurFlowType}
                flowTypeInfo={flowTypeInfo}
                toggleFlowType={s.toggleFlowType}
              />
            ),
        )}
      </div>

      {showTabs && (
        <div className={styles.tabs}>
          {tabSections
            .filter(s => s.hide !== true)
            .map(s => (
              <button
                className={classNames(styles.tabToggle, {
                  [styles.selected]: s.slug === curTab,
                  [styles.invis]: s.invis,
                })}
                onClick={() => setCurTab(s.slug)}
              >
                {s.header}
              </button>
            ))}
          {
            <Loading
              small={true}
              loaded={!haveAny || !tabSections.some(s => s.invis === true)}
              margin={"0 0 0 20px"}
              top={5}
            />
          }
        </div>
      )}
      {showTabs && haveAny && (
        <div className={styles.tabContent}>
          {tabSections
            .filter(s => s.hide !== true)
            .map(
              s =>
                !s.noData && (
                  <Tab
                    selected={curTab === s.slug}
                    content={s.content.map(
                      s =>
                        !s.hide && (
                          <DetailsSection
                            header={s.header}
                            text={s.text}
                            content={s.content}
                            curFlowType={curFlowType}
                            setCurFlowType={setCurFlowType}
                            flowTypeInfo={flowTypeInfo}
                            toggleFlowType={s.toggleFlowType}
                          />
                        ),
                    )}
                  />
                ),
            )}
        </div>
      )}
      {[].map(
        s =>
          !s.hide && (
            <DetailsSection
              header={s.header}
              content={s.content}
              curFlowType={curFlowType}
              setCurFlowType={setCurFlowType}
              flowTypeInfo={flowTypeInfo}
              toggleFlowType={s.toggleFlowType}
            />
          ),
      )}

      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"pvsTooltip"}
          type="light"
          className={classNames(
            tooltipStyles.tooltip,
            tooltipStyles.simple,
            tooltipStyles.fullTable,
          )}
          place="top"
          effect="float"
          getContent={() =>
            pvsTooltipData && (
              <div>
                <div className={tooltipStyles.header}>
                  {pvsTooltipData.title}
                </div>
                <div className={tooltipStyles.content}>
                  <table>
                    <thead>
                      <tr>
                        {pvsTooltipData.cols.map(d => (
                          <th>{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pvsTooltipData.rows.map(d => (
                        <tr>
                          {d.map(dd => (
                            <td>{dd}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
        />
      }
    </div>
  )
}

export default Details
