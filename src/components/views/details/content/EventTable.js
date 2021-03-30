// 3rd party libs
import React, { useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";

// local
import { getNodeLinkList } from "../../../misc/Data.js";
import Util from "../../../misc/Util.js";
import { Loading, SmartTable } from "../../../common";
import { cols } from "../../export/Export";

// queries
import { execute, Outbreak, Flow, Excel } from "../../../misc/Queries";

// FC for EventTable.
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
  ...props
}) => {
  // STATE //
  const [outbreaks, setOutbreaks] = useState([]);
  const [flows, setFlows] = useState([]);
  const [nTotalRecords, setNTotalRecords] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fetchingRows, setFetchingRows] = useState(false);
  const [searchText, setSearchText] = useState("");

  // table state
  const [pagesize, setPagesize] = useState(5);
  const [curPage, setCurPage] = useState(1);
  const [sortCol, setSortCol] = useState("Project.response_committed_funds");
  const [isDesc, setIsDesc] = useState(true);

  // CONSTANTS //
  const showBothFlowTypes = curFlowType === undefined;
  const standardCols = [
    {
      title: "PHEIC",
      prop: "events",
      entity: "project_constants",
      type: "text",
      func: d => {
        // get link to outbreak page
        const matchingOutbreaks = outbreaks.filter(dd =>
          d.events.includes(dd.id)
        );

        return matchingOutbreaks.map((dd, ii) => {
          const comma = ii !== matchingOutbreaks.length - 1 ? ", " : null;
          return (
            <span>
              <Link {...{ to: `/events/${dd.slug}` }}>{dd.name}</Link>
              {comma}
            </span>
          );
        });
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
        })
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
        })
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
  ];

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
        const ft = d["response_" + curFlowType];
        const financial = !d.is_inkind;
        if (financial) return ft;
        else {
          // If no financial, check for inkind
          const inkindField =
            curFlowType === "disbursed_funds"
              ? "response_provided_inkind"
              : "response_committed_inkind";
          const inkind = d[inkindField] !== null;
          if (inkind) return -7777;
          else return -9999;
        }
      },

      render: d =>
        d === -7777
          ? Util.formatValue("In-kind support", "inkind")
          : Util.formatValue(d, curFlowType),
    };
  };
  const getTableColumns = (standardCols, showBothFlowTypes) => {
    if (!showBothFlowTypes) {
      const curFlowTypeCol = getFlowTypeCol(curFlowType, curFlowTypeName);
      return standardCols.concat(curFlowTypeCol);
    } else
      return standardCols.concat([
        getFlowTypeCol("disbursed_funds", "Disbursed funds"),
        getFlowTypeCol("committed_funds", "Committed funds"),
      ]);
  };

  const exportExcel = async () => getData(true);

  const getData = async (forExport = false) => {
    const queries = {
      outbreaks: Outbreak({}),
    };

    // define params for flow query
    const flowParams = {
      page: curPage,
      pagesize,
      isDesc,
      sortCol,
      format: ["stakeholder_details"],
      searchText,
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
      ],
    };

    // define filters
    const flowFilters = {
      "Project_Constants.response_or_capacity": ["both", "response"],
    };
    // Add event ID filter if defined
    if (eventId !== undefined)
      flowFilters["Project_Constants.events"] = [["has", [eventId]]];

    if (isGhsaPage) {
      // add GHSA filter
      flowFilters["Project_Constants.is_ghsa"] = [true];

      // get flows for GHSA
      queries.flows = Flow({
        ...flowParams,
        filters: flowFilters,
      });
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
      });
    }

    if (forExport) {
      // download excel
      const { data, params } = await queries.flows;
      data.cols = cols;
      await Excel({ method: "post", data, params });
    } else {
      setFetchingRows(true);
      const results = await execute({ queries });
      setFetchingRows(false);

      // filter out flows with outbreaks not in database
      const eventsNotNull = d => d.events.length !== 0 && d.events[0] !== null;
      const newFlows = results.flows.data.filter(eventsNotNull);
      setFlows(newFlows);
      setNTotalRecords(results.flows.paging.n_records);
      setOutbreaks(results.outbreaks);
      setEventTotalsData(newFlows);
      setDataLoaded(true);
      setLoaded(true);
    }
  };

  // FUNCTION CALLS //
  const tableColumns = getTableColumns(standardCols, showBothFlowTypes);

  // EFFECT HOOKS //
  useLayoutEffect(() => {
    if (!dataLoaded) {
      getData();
    }
  }, [dataLoaded]);

  useLayoutEffect(() => {
    if (dataLoaded) {
      getData();
    }
  }, [curPage, pagesize]);

  useLayoutEffect(() => {
    if (dataLoaded) {
      if (curPage !== 1) setCurPage(1);
      else getData();
    }
  }, [sortCol, isDesc, searchText]);

  useLayoutEffect(() => {
    setFlows([]);
    setDataLoaded(false);
  }, [id, direction]);

  return (
    <Loading loaded={dataLoaded}>
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
    </Loading>
  );
};

export default EventTable;

const downloadExcel = () => {
  //
};
