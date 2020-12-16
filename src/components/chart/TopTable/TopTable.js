import React, { useState, useEffect } from "react";
import Util from "../../misc/Util";
import { execute, NodeSums } from "../../misc/Queries";
import TableInstance from "../table/TableInstance";
import { Settings } from "../../../App.js";

// FC for TopTable.
const TopTable = ({
  id,
  curFlowType,
  otherEntityRole,
  otherNodeType,
  direction,
  ...props
}) => {
  const [data, setData] = useState(null);
  const updateData = async () => {
    // top funder / recipient table
    const queries = {};
    queries.data = NodeSums({
      format: "table",
      direction, // "origin"
      group_by: "Core_Element.name",
      filters: {
        "OtherStakeholder.id": [id],
        "Flow.flow_type": ["disbursed_funds", "committed_funds"],
        "Flow.year": [
          ["gt_eq", Settings.startYear],
          ["lt_eq", Settings.endYear],
        ],
      },
    });
    const results = await execute({ queries });
    setData(results.data);
  };
  // when certain selections change, retrieve updated data
  useEffect(() => {
    updateData();
  }, []);

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

  if (data === null)
    return (
      <div>{[curFlowType, otherEntityRole, otherNodeType].join("; ")}</div>
    );
  else
    return (
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
            func: d => JSON.stringify(d[otherNodeType]),
            render: d => "mvm",
            // render: d =>
            //   getNodeLinkList({
            //     urlType: "details",
            //     nodeList: JSON.parse(d),
            //     entityRole: otherEntityRole,
            //     id: id,
            //   }),
          },
        ].concat(topTableCols)}
        tableData={data ? data.filter(d => d[curFlowType] !== undefined) : []}
      />
    );
};

export default TopTable;
