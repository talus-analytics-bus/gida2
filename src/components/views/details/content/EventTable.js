// 3rd party libs
import React, { useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";

// local
import { getNodeLinkList } from "../../../misc/Data.js";
import Util from "../../../misc/Util.js";
import { Loading } from "../../../common";
import TableInstance from "../../../chart/table/TableInstance.js";

// queries
import { execute, Outbreak, Flow } from "../../../misc/Queries";

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
  const [dataLoaded, setDataLoaded] = useState(false);

  // CONSTANTS //
  const showBothFlowTypes = curFlowType === undefined;
  const standardCols = [
    {
      title: "PHEIC",
      prop: "event",
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
      prop: "project_name",
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
      prop: "year_range_proj",
      type: "text",
      func: d => d.years,
      render: d => d,
    },
  ];

  // FUNCTIONS //
  const getFlowTypeCol = (curFlowType, curFlowTypeName) => {
    return {
      title: curFlowTypeName + ' (or "In-kind support")',
      prop: `amount-${curFlowType}`,
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

  const getData = async () => {
    const queries = {
      outbreaks: Outbreak({}),
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
        format: ["stakeholder_details"],
        filters: flowFilters,
      });
    } else {
      // get flows for defined target/origin
      queries.flows = Flow({
        format: ["stakeholder_details"],
        filters: flowFilters,
        [direction + "Ids"]: [id],
        [otherDirection + "Ids"]: [],
      });
    }

    const results = await execute({ queries });

    // filter out flows with outbreaks not in database
    const eventsNotNull = d => d.events.length !== 0 && d.events[0] !== null;
    const newFlows = results.flows.data.filter(eventsNotNull);
    setFlows(newFlows);
    setOutbreaks(results.outbreaks);
    setEventTotalsData(newFlows);
    setDataLoaded(true);
    setLoaded(true);
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
    setFlows([]);
    setDataLoaded(false);
  }, [id, direction]);

  return (
    <Loading loaded={dataLoaded}>
      <TableInstance
        paging={true}
        sortByProp={props.sortByProp || "years"}
        tableColumns={tableColumns}
        tableData={flows}
        hide={r => r.amount === -9999}
      />
    </Loading>
  );

  return <div />;
};

export default EventTable;
