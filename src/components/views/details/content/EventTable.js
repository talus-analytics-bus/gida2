// 3rd party libs
import React, { useState, useLayoutEffect } from "react"

// local
import { EventLink } from "./../../events/EventLink"
import { getNodeLinkList } from "../../../misc/Data.js"
import Util from "../../../misc/Util.js"
import { Loading, SmartTable } from "../../../common"
import { PagesizePicker } from "../../../common/SmartTable/Paginator/Paginator"
import { cols } from "../../export/Export"

// queries
import { execute, Outbreak, Flow, Excel } from "../../../misc/Queries"

/**
 *
 * @param {*} o Parameters object
 * @param {number} o.id
 * The unique ID of the stakeholder for whom response funding projects need to
 * be shown in the table.
 * @param {number} o.eventId
 * Optional: The unique ID of the event that projects in the table should
 * pertain to. If undefined, then data for any event is returned.
 * @param {boolean} o.hideName
 * If true, hides the column that provides the name of the event.
 * @param {"origin" | "target"} o.direction
 * Optional: If `o.id` is defined: a string representing whether the
 * stakeholder with unique ID `o.id` is the origin or target of the projects
 * shown in the table.
 * @param {"origin" | "target"} o.otherDirection
 * Optional: The opposite of the direction defined in `o.direction`.
 * @param {"funder" | "recipient"} o.entityRole
 * Optional: The funding role implied by the value of `o.direction`.
 * @param {"funder" | "recipient"} o.otherEntityRole
 * Optional: The funding role implied by the value of `o.otherDirection`. Note:
 * this value is not currently used.
 * @param {"committed_funds" | "disbursed_funds"} o.curFlowType
 * Optional: If only one flow type should be shown in the table at a time,
 * the unique ID of it.
 * @param {"Committed funds" | "Disbursed funds"} o.curFlowTypeName
 * Optional: If only one flow type should be shown in the table at a time,
 * the name of it.
 * @param {boolean} isGhsaPage
 * True if this table appears on the GHSA page, false otherwise. If true, will
 * trigger the use of certain filters to retrieve and show GHSA-specific data.
 * @param {Function<Record<string, any>} setEventTotalsData
 * Optional: Function that sets data used to determine sum total of
 * response funding from the projects shown in the table. This value can be
 * displayed outside the table, e.g., above it.
 * @param {Function<boolean>} setLoaded
 * Function that sets whether the table has been loaded and is ready to be
 * rendered or not.
 * @returns {ReactElement} The table of response funding projects.
 */
const EventTable = ({
  id,
  eventId,

  // hide col. that shows name of event if true
  hideName = false,
  direction,
  otherDirection,
  entityRole,
  otherEntityRole,
  curFlowType,
  curFlowTypeName,
  isGhsaPage = false,
  setEventTotalsData = () => "",
  setLoaded = () => "",
}) => {
  // STATE //
  const [outbreaks, setOutbreaks] = useState([])
  const [flows, setFlows] = useState([])
  const [nTotalRecords, setNTotalRecords] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [fetchingRows, setFetchingRows] = useState(false)
  const [searchText, setSearchText] = useState("")

  // table state
  const [pagesize, setPagesize] = useState(5)
  const [curPage, setCurPage] = useState(1)
  const [sortCol, setSortCol] = useState("Project.response_committed_funds")
  const [isDesc, setIsDesc] = useState(true)

  // CONSTANTS //
  const showBothFlowTypes = curFlowType === undefined
  const standardCols = [
    {
      title: "PHEIC",
      prop: "events",
      entity: "project_constants",
      type: "text",
      func: d => {
        // get link to outbreak page
        const matchingOutbreaks = outbreaks.filter(dd =>
          d.events.includes(dd.id),
        )

        return matchingOutbreaks.map((dd, ii) => {
          const comma = ii !== matchingOutbreaks.length - 1 ? ", " : null
          return (
            <span>
              <EventLink {...{ name: dd.name, slug: dd.slug }} />
              {comma}
            </span>
          )
        })
      },
      render: d => d,
      hide: hideName,
    },
    {
      title: "Project name",
      prop: "name",
      entity: "Project",
      type: "text",
      func: d => d.name,
      render: d => d,
    },
    {
      title: Util.getInitCap(
        Util.getRoleTerm({
          type: "noun",
          role: "funder",
        }),
      ),
      prop: "origins",
      entity: "project_constants",
      type: "text",
      func: d => JSON.stringify(d.origins),
      render: d =>
        getNodeLinkList({
          urlType: "details",
          nodeList: JSON.parse(d),
          entityRole: "funder",
          id,
        }),
    },
    {
      title: Util.getInitCap(
        Util.getRoleTerm({
          type: "noun",
          role: "recipient",
        }),
      ),
      prop: "targets",
      entity: "project_constants",
      type: "text",
      func: d => JSON.stringify(d.targets),
      render: d =>
        getNodeLinkList({
          urlType: "details",
          nodeList: JSON.parse(d),
          entityRole: "recipient",
          id,
        }),
    },
    {
      title: "Funding year(s)",
      prop: "years_response",
      entity: "project_constants",
      type: "text",
      func: d => d.years_response,
      render: d => d,
    },
  ]

  // FUNCTIONS //
  const getFlowTypeCol = (curFlowType, curFlowTypeName) => {
    return {
      title: curFlowTypeName + ' (or "In-kind support")',
      prop: `response_${curFlowType}`,
      entity: "Project",
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      func: d => {
        // Check whether the monetary amount is available
        const ft = d["response_" + curFlowType]
        const financial = !d.is_inkind
        if (financial) return ft
        else {
          // If no financial, check for inkind
          const inkindField =
            curFlowType === "disbursed_funds"
              ? "response_provided_inkind"
              : "response_committed_inkind"
          const inkind = d[inkindField] !== null
          if (inkind) return -7777
          else return -9999
        }
      },

      render: d =>
        d === -7777
          ? Util.formatValue("In-kind support", "inkind")
          : Util.formatValue(d, curFlowType),
    }
  }
  const getTableColumns = (standardCols, showBothFlowTypes) => {
    if (!showBothFlowTypes) {
      const curFlowTypeCol = getFlowTypeCol(curFlowType, curFlowTypeName)
      return standardCols.concat(curFlowTypeCol)
    } else
      return standardCols.concat([
        getFlowTypeCol("committed_funds", "Committed funds"),
        getFlowTypeCol("disbursed_funds", "Disbursed funds"),
      ])
  }

  const exportExcel = async () => getData(true)

  const getData = async (forExport = false) => {
    const queries = {
      outbreaks: Outbreak({}),
    }

    // define params for flow query
    const flowParams = {
      page: curPage,
      pagesize,
      isDesc,
      sortCol,
      searchText,
      format: ["stakeholder_details"],
      forExport,
      fields: [
        "Project.name",
        "Project.response_disbursed_funds",
        "Project.response_committed_funds",
        "Project.response_provided_inkind",
        "Project.response_committed_inkind",
        "project_constants.targets",
        "project_constants.origins",
        "project_constants.events",
        "project_constants.years_response",
        "project_constants.is_inkind",
      ],
    }

    // define filters
    const flowFilters = {
      "Project.events": [["not_empty"]],
    }
    // Add event ID filter if defined
    if (eventId !== undefined)
      flowFilters["Project_Constants.events"] = [["has", [eventId]]]

    if (isGhsaPage) {
      // add GHSA filter
      flowFilters["Project_Constants.is_ghsa"] = [true]

      // get flows for GHSA
      queries.flows = Flow({
        ...flowParams,
        filters: flowFilters,
      })
    } else {
      // get flows for defined target/origin
      queries.flows = Flow({
        ...flowParams,
        filters: flowFilters,
        [direction + "Ids"]: [id],
        [otherDirection + "Ids"]: [],
        page: curPage,
        pagesize,
        isDesc,
        sortCol,
      })
    }

    if (forExport) {
      // download excel
      const { data, params } = await queries.flows
      data.cols = cols.filter(d => d[0] !== "years_response")
      await Excel({ method: "post", data, params })
    } else {
      setFetchingRows(true)
      const results = await execute({ queries })
      setFetchingRows(false)

      // filter out flows with outbreaks not in database
      const eventsNotNull = d => d.events.length !== 0 && d.events[0] !== null
      const newFlows = results.flows.data.filter(eventsNotNull)
      setFlows(newFlows)
      setNTotalRecords(results.flows.paging.n_records)
      setOutbreaks(results.outbreaks)
      setEventTotalsData(newFlows)
      setDataLoaded(true)
      setLoaded(true)
    }
  }

  // FUNCTION CALLS //
  const tableColumns = getTableColumns(standardCols, showBothFlowTypes)

  // EFFECT HOOKS //
  useLayoutEffect(() => {
    if (!dataLoaded) {
      getData()
    }
  }, [dataLoaded])

  useLayoutEffect(() => {
    if (dataLoaded) {
      getData()
    }
  }, [curPage, pagesize])

  useLayoutEffect(() => {
    if (dataLoaded) {
      if (curPage !== 1) setCurPage(1)
      else getData()
    }
  }, [sortCol, isDesc, searchText])

  useLayoutEffect(() => {
    setFlows([])
    setDataLoaded(false)
  }, [id, direction, entityRole])

  return (
    <Loading {...{ loaded: dataLoaded, slideUp: true, top: "-20px" }}>
      <SmartTable
        {...{
          data: flows,
          columns: tableColumns.filter(d => d.hide !== true),
          nTotalRecords,
          loading: fetchingRows,
          curPage,
          pagesize,
          sortCol,
          isDesc,
          searchText,
          setPagesize,
          setCurPage,
          setSortCol,
          setIsDesc,
          setSearchText,
          exportExcel,
        }}
      />
      <PagesizePicker
        {...{
          pagesize,
          setPagesize,
          curPage,
          nTotalRecords,
        }}
      />
    </Loading>
  )
}

export default EventTable
