import React, { useState, useLayoutEffect } from "react";
import styles from "../details.module.scss";
import classNames from "classnames";
import { Settings } from "../../../../App.js";
import {
  getNodeLinkList,
  getWeightsBySummaryAttributeSimple,
  getSummaryAttributeWeightsByNode,
  isUnknownDataOnly,
  parseIdsAsNames,
} from "../../../misc/Data.js";
import Util from "../../../misc/Util.js";
import Loading from "../../../common/Loading/Loading";

// local components
import TableInstance from "../../../chart/table/TableInstance.js";

// queries
import { execute, Outbreak, Flow } from "../../../misc/Queries";

// FC for EventTable.
const EventTable = ({
  id,
  direction,
  otherDirection,
  entityRole,
  otherEntityRole,
  curFlowType,
  curFlowTypeName,
  isGhsaPage = false,
  ...props
}) => {
  // STATE //
  const [outbreaks, setOutbreaks] = useState([]);
  const [flows, setFlows] = useState({ data: [] });
  const [dataLoaded, setDataLoaded] = useState(false);

  const getData = async () => {
    const queries = {
      outbreaks: Outbreak({}),
    };

    if (isGhsaPage) {
      // get flows for GHSA
      queries.flows = Flow({
        format: ["stakeholder_details"],
        filters: {
          "Project_Constants.response_or_capacity": ["response"],
          "Project_Constants.is_ghsa": [true],
        },
      });
    } else {
      // get flows for defined target/origin
      queries.flows = Flow({
        format: ["stakeholder_details"],
        filters: { "Project_Constants.response_or_capacity": ["response"] },
        [direction + "Ids"]: [id],
        [otherDirection + "Ids"]: [],
      });
    }
    const results = await execute({ queries });
    setFlows(results.flows);
    setOutbreaks(results.outbreaks);
    setDataLoaded(true);
  };

  useLayoutEffect(() => {
    if (!dataLoaded) {
      getData();
    }
  }, [dataLoaded]);

  useLayoutEffect(() => {
    setFlows({ data: [] });
    setDataLoaded(false);
  }, [id, direction]);

  return (
    <Loading loaded={dataLoaded}>
      <TableInstance
        paging={true}
        sortByProp={"years"}
        tableColumns={[
          {
            title: "Event response",
            prop: "event",
            type: "text",
            func: d => {
              return outbreaks
                .filter(dd => d.events.includes(dd.id))
                .map(dd => dd.name)
                .join("· ");
            },
            render: d => d,
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
          {
            title: curFlowTypeName + ' (or "In-kind support")',
            prop: "amount",
            type: "num",
            className: d => (d > 0 ? "num" : "num-with-text"),
            func: d => {
              // Check whether the monetary amount is available
              const ft = d[curFlowType];
              const financial = !d.is_inkind;
              if (financial) return ft;
              else {
                // If no financial, check for inkind
                const inkindField =
                  curFlowType === "disbursed_funds"
                    ? "provided_inkind"
                    : "committed_inkind";
                const inkind = d[inkindField] !== null;
                if (inkind) return -7777;
                else return -9999;
              }
            },
            render: d =>
              d === -7777
                ? Util.formatValue("In-kind support", "inkind")
                : Util.formatValue(d, curFlowType),
          },
        ]}
        tableData={flows.data}
        hide={r => r.amount === -9999}
      />
    </Loading>
  );

  return <div />;
};

export default EventTable;
