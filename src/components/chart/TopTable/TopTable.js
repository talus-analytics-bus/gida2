import React, { useState, useEffect, useContext } from "react";
import Util, { isEmpty } from "../../misc/Util";
import { getNodeLinkList, parseIdsAsNames } from "../../misc/Data";
import Loading from "../../common/Loading/Loading";
import { execute, NodeSums, Stakeholder } from "../../misc/Queries";
import TableInstance from "../table/TableInstance";
import { Settings } from "../../../App.js";
// import { appContext, defaultContext } from "../../misc/ContextProvider";

// FC for TopTable.
const TopTable = ({
  id,
  curFlowType,
  otherEntityRole,
  otherNodeType,
  direction,
  staticStakeholders,
  ...props
}) => {
  // CONSTANTS // ---------------------------------------------------------- //
  const isGhsaPage = id === "ghsa";

  // // CONTEXT //
  // const context = useContext(appContext) || defaultContext;
  const [data, setData] = useState(null);
  const [stakeholders, setStakeholders] = useState(
    staticStakeholders !== undefined ? staticStakeholders : null
  );
  const getData = async () => {
    const filters = {
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
      "Stakeholder.subcat": [["neq", ["sub-organization", "agency"]]],
    };

    if (!isGhsaPage) {
      filters["OtherStakeholder.id"] = [id];
    } else {
      filters["Flow.is_ghsa"] = [true];
    }

    // top funder / recipient table
    const queries = {
      data: NodeSums({
        format: "table",
        direction, // "origin"
        group_by: "Core_Element.name",
        filters,
      }),
    };
    if (staticStakeholders === undefined)
      queries.stakeholders = Stakeholder({ by: "id" });
    const results = await execute({ queries });
    setData(results.data);
    if (staticStakeholders === undefined) {
      setStakeholders(results.stakeholders);
    }
  };

  useEffect(() => {
    if (data === null) getData();
  }, [data]);

  // when certain selections change, retrieve updated data
  useEffect(() => {
    setData(null);
  }, [id, direction]);

  // CONSTANTS // ---------------------------------------------------------- //
  // Define standard colums for Top Funders and Top Recipients tables.
  const topTableCols = [
    {
      prop: "_tot",
      func: d => (d[curFlowType] ? d[curFlowType]._tot : undefined),
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      title: `Total ${
        curFlowType === "disbursed_funds" ? "disbursed" : "committed"
      }`,
      render: v => Util.formatValue(v, "disbursed_funds"),
    },
  ].concat(
    [
      ["P", "Prevent"],
      ["D", "Detect"],
      ["R", "Respond"],
      ["Other", "Other"],
      ["General IHR", "General IHR Implementation"],
      ["Unspecified", "Unspecified"],
    ].map(c => {
      return {
        func: d => (d[curFlowType] ? d[curFlowType][c[0]] : undefined),
        type: "num",
        className: d => (d > 0 ? "num" : "num-with-text"),
        title: c[1],
        prop: c[1],
        render: v => Util.formatValue(v, "disbursed_funds"),
      };
    })
  );

  const loaded =
    data !== null && (data.length === 0 || data[0][direction] !== undefined);
  return (
    <Loading loaded={loaded}>
      {loaded && (
        <TableInstance
          sortByProp={"_tot"}
          paging={true}
          tableColumns={[
            {
              title: Util.getInitCap(
                Util.getRoleTerm({
                  type: "noun",
                  role: otherEntityRole,
                })
              ),
              prop: otherNodeType,
              type: "text",
              func: d => {
                return JSON.stringify(d[otherNodeType]);
              },
              render: d => {
                return getNodeLinkList({
                  urlType: "details",
                  nodeList: JSON.parse(d),
                  entityRole: otherEntityRole,
                  id: id,
                });
              },
            },
          ].concat(topTableCols)}
          tableData={data ? data.filter(d => d[curFlowType] !== undefined) : []}
        />
      )}
    </Loading>
  );
};

export default TopTable;
