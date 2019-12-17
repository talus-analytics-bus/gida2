import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./entitytable.module.scss";
import { Settings } from "../../../App.js";
import {
  getWeightsBySummaryAttribute,
  getNodeLinkList
} from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";
import Tab from "../../views/entitytable/content/Tab.js";
import GhsaToggle from "../../misc/GhsaToggle.js";
import EntityRoleToggle from "../../misc/EntityRoleToggle.js";

// FC for EntityTable.
const EntityTable = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  otherId,
  setComponent,
  ...props
}) => {
  // Get page type from id
  let pageType;
  if (id.toLowerCase() === "ghsa") pageType = "ghsa";
  else if (id.toLowerCase() === "outbreak-response")
    pageType = "outbreak-response";
  else pageType = "entity";

  // Get master summary
  const masterSummary = data.flowBundles.master_summary;

  // List of all flow types
  const allFlowTypes = [
    "disbursed_funds",
    "committed_funds",
    "provided_inkind",
    "committed_inkind"
  ];

  /**
   * Returns column definitions for all assistance types for use in
   * TableInstance
   * @method getAssistanceTableCols
   * @param  {[type]}               flowTypeInfo [description]
   * @return {[type]}                            [description]
   */
  const getAssistanceTableCols = flowTypeInfo => {
    return allFlowTypes.map(ft => {
      const match = flowTypeInfo.find(d => d.name === ft);
      return {
        title: `${match.display_name} (${Settings.startYear} - ${
          Settings.endYear
        })`,
        prop: match.name,
        render: val => Util.formatValue(val, match.name),
        type: "num",
        func: d => d[ft] || undefined
      };
    });
  };

  // Define other entity role, which is used in certain charts
  const otherEntityRole = entityRole === "funder" ? "recipient" : "funder";

  // Define funder/recipient columns to be displayed as appropriate.
  const funderCol = {
    title: "Funder",
    prop: "source",
    type: "text",
    func: d =>
      getNodeLinkList({
        urlType: entityRole === "funder" ? "table" : "pair-table",
        nodeList: d["source"],
        entityRole: "funder",
        id: id,
        otherId: otherId
      })
  };

  const recipientCol = {
    title: "Recipient",
    prop: "target",
    type: "text",
    func: d =>
      getNodeLinkList({
        urlType: entityRole === "recipient" ? "table" : "pair-table",
        nodeList: d["target"],
        entityRole: "recipient",
        id: id,
        otherId: otherId
      })
  };

  const sections = [
    {
      header: "All funds",
      slug: "all",
      content: (
        <TableInstance
          tableColumns={[
            {
              title: "Funder",
              prop: "source",
              type: "text",
              func: d =>
                getNodeLinkList({
                  urlType: entityRole === "funder" ? "table" : "pair-table",
                  nodeList: d["source"],
                  entityRole: "funder",
                  id: id,
                  otherId: otherId
                })
            },
            {
              title: "Recipient",
              prop: "target",
              type: "text",
              func: d =>
                getNodeLinkList({
                  urlType: entityRole === "recipient" ? "table" : "pair-table",
                  nodeList: d["target"],
                  entityRole: "recipient",
                  id: id,
                  otherId: otherId
                })
            },
            {
              title: "Project name",
              func: d => d.flow_info.project_name,
              type: "text",
              prop: "project_name",
              render: val => Util.formatValue(val, "project_name")
            },
            {
              title: `Disbursed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d =>
                d.master_summary.flow_types.disbursed_funds
                  ? d.master_summary.flow_types.disbursed_funds
                      .focus_node_weight
                  : undefined,
              type: "num",
              prop: "disbursed_funds",
              render: val => Util.formatValue(val, "disbursed_funds"),
              defaultContent: "n/a"
            },
            {
              title: `Committed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d =>
                d.master_summary.flow_types.committed_funds
                  ? d.master_summary.flow_types.committed_funds
                      .focus_node_weight
                  : undefined,
              type: "num",
              prop: "committed_funds",
              render: val => Util.formatValue(val, "committed_funds"),
              defaultContent: "n/a"
            }
          ]}
          sortByProp={"disbursed_funds"}
          tableData={data.flows.filter(f =>
            f.flow_info.assistance_type.toLowerCase().includes("financial")
          )}
        />
      )
    },
    {
      header: "Funds by " + otherEntityRole, // TODO other role
      slug: "funds_by_other",
      content: (
        <TableInstance
          sortByProp={"disbursed_funds"}
          tableColumns={[
            otherEntityRole === "funder" ? funderCol : recipientCol,
            otherEntityRole === "funder" ? recipientCol : funderCol,
            {
              title: `Disbursed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d =>
                d.flow_types.disbursed_funds
                  ? d.flow_types.disbursed_funds.focus_node_weight
                  : undefined,
              type: "num",
              prop: "disbursed_funds",
              render: val => Util.formatValue(val, "disbursed_funds"),
              defaultContent: "n/a"
            },
            {
              title: `Committed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d =>
                d.flow_types.committed_funds
                  ? d.flow_types.committed_funds.focus_node_weight
                  : undefined,
              type: "num",
              prop: "committed_funds",
              render: val => Util.formatValue(val, "committed_funds"),
              defaultContent: "n/a"
            }
          ]}
          // tableData={data.flowBundlesByNeighbor.flow_bundles}
          tableData={data.flowBundlesByNeighbor.flow_bundles.filter(
            f => f.flow_types.committed_funds || f.flow_types.disbursed_funds
          )}
        />
      )
    },
    {
      header: "Funds by core element",
      slug: "ce",
      content: (
        <TableInstance
          sortByProp={"disbursed_funds"}
          tableColumns={[
            {
              title: "Core element",
              prop: "attribute"
            }
          ].concat(getAssistanceTableCols(flowTypeInfo))}
          tableData={getWeightsBySummaryAttribute({
            field: "core_elements",
            flowTypes: allFlowTypes,
            data: [masterSummary]
          })}
        />
      )
    },
    {
      header: "Funds by core capacity",
      slug: "cc",
      content: (
        <TableInstance
          sortByProp={"disbursed_funds"}
          tableColumns={[
            {
              title: "Core capacity",
              prop: "attribute"
            }
          ].concat(getAssistanceTableCols(flowTypeInfo))}
          tableData={getWeightsBySummaryAttribute({
            field: "core_capacities",
            flowTypes: allFlowTypes,
            data: [masterSummary]
          })}
        />
      )
    },
    {
      header: "In-kind contributions",
      slug: "in-kind",
      content: (
        <TableInstance
          sortByProp={"provided_inkind"}
          tableColumns={[
            {
              title: "Provider",
              prop: "source",
              type: "text",
              func: d =>
                getNodeLinkList({
                  urlType: entityRole === "funder" ? "table" : "pair-table",
                  nodeList: d["source"],
                  entityRole: "funder",
                  id: id,
                  otherId: otherId
                })
            },
            {
              title: "Recipient",
              prop: "target",
              type: "text",
              func: d =>
                getNodeLinkList({
                  urlType: entityRole === "recipient" ? "table" : "pair-table",
                  nodeList: d["target"],
                  entityRole: "recipient",
                  id: id,
                  otherId: otherId
                })
            },
            {
              title: "Project name",
              func: d => d.flow_info.project_name,
              type: "text",
              prop: "project_name"
            },
            {
              title: "Years project provided",
              func: d =>
                d.master_summary.flow_types.provided_inkind
                  ? d.master_summary.flow_types.provided_inkind
                      .focus_node_weight
                  : undefined,
              type: "num",
              prop: "provided_inkind",
              render: val => Util.formatValue(val, "yes_no"),
              defaultContent: "n/a"
            },
            {
              title: "Years project committed",
              func: d =>
                d.master_summary.flow_types.committed_inkind
                  ? d.master_summary.flow_types.committed_inkind
                      .focus_node_weight
                  : undefined,
              type: "num",
              prop: "committed_inkind",
              render: val => Util.formatValue(val, "yes_no"),
              defaultContent: "n/a"
            }
          ]}
          tableData={data.flows.filter(f =>
            f.flow_info.assistance_type.toLowerCase().includes("in-kind")
          )}
        />
      )
    }
  ];

  // Track currently visible tab
  const [curTab, setCurTab] = React.useState(sections[0].slug);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.entityTable)}>
      {otherId === undefined && (
        <div className={styles.header}>
          <div className={styles.upper}>
            {pageType !== "ghsa" && (
              <GhsaToggle ghsaOnly={ghsaOnly} setGhsaOnly={setGhsaOnly} />
            )}
            <h1>
              {
                // <Link to={`/details/${data.nodeData.id}/${entityRole}`}>
                //   {data.nodeData.name}
                // </Link>
                data.nodeData.name
              }
            </h1>
            <Link to={`/details/${id}/${entityRole || "funder"}`}>
              <button>Back to summary</button>
            </Link>
          </div>
          {pageType !== "ghsa" && (
            <div className={styles.lower}>
              <EntityRoleToggle
                entityRole={entityRole}
                redirectUrlFunc={v => `/table/${id}/${v}`}
                callback={() => setComponent(null)}
              />
            </div>
          )}
        </div>
      )}
      {otherId !== undefined && (
        <div className={styles.header}>
          <div className={styles.upper}>
            <Link to={`/table/${id}/funder`}>
              <button>Go to funder table</button>
            </Link>
            <h1>
              {data.nodeData.name} → {data.nodeDataOther.name}
            </h1>
            <Link to={`/table/${otherId}/recipient`}>
              <button>Go to recipient table</button>
            </Link>
          </div>
          <div className={styles.lower}>
            {pageType !== "ghsa" && (
              <GhsaToggle ghsaOnly={ghsaOnly} setGhsaOnly={setGhsaOnly} />
            )}
          </div>
        </div>
      )}
      <div className={styles.tabs}>
        {sections.map(s => (
          <button onClick={() => setCurTab(s.slug)}>{s.header}</button>
        ))}
      </div>
      <div className={styles.content}>
        {sections.map(s => (
          <Tab selected={curTab === s.slug} content={s.content} />
        ))}
      </div>
    </div>
  );
};

export const renderEntityTable = ({
  component,
  setComponent,
  loading,
  id,
  otherId,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly
}) => {
  // Get data
  if (loading) {
    return <div>Loading...</div>;
  } else if (
    component === null ||
    (component &&
      (component.props.id !== id ||
        component.props.otherId !== otherId ||
        component.props.entityRole !== entityRole))
  ) {
    getComponentData({
      setComponent: setComponent,
      id: id,
      otherId: otherId,
      entityRole: entityRole,
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly
    });

    return <div />;
  } else {
    console.log("COMPONENT EXISTS");
    return component;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for special detail pages like GHSA and response
 * @method getComponentData
 * @param  {[type]}       setDetailsComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityRole          [description]
 */
const getComponentData = async ({
  setComponent,
  id,
  otherId,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly
}) => {
  // Set base query params for FlowBundleFocusQuery and FlowBundleGeneralQuery
  const nodeType = entityRole === "recipient" ? "target" : "source";
  const otherNodeType = entityRole === "recipient" ? "source" : "target";
  const baseQueryParams = {
    focus_node_ids: id !== "ghsa" ? [id] : null,
    focus_node_type: nodeType,
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: false,

    // Add filters as appropriate.
    filters:
      // If not GHSA page,
      id !== "ghsa"
        ? // And the "other ID" (recipient) of a pair has been defined,
          otherId !== undefined
          ? // Then include filters for source and target as appropriate
            { flow_attr_filters: [[nodeType, id], [otherNodeType, otherId]] }
          : // Otherwise, only filter by one of those (source or target)
            { flow_attr_filters: [[nodeType, id]] }
        : {},
    summaries: {
      parent_flow_info_summary: ["core_capacities", "core_elements"],
      datetime_summary: ["year"]
    },
    include_master_summary: true
  };

  // Set base query params for FlowQuery
  const baseFlowQueryParams = JSON.parse(JSON.stringify(baseQueryParams));

  // If GHSA page, then filter by GHSA.
  if (id === "ghsa" || ghsaOnly === "true") {
    baseQueryParams.filters.parent_flow_info_filters = [
      ["ghsa_funding", "true"]
    ];
    baseFlowQueryParams.filters.flow_info_filters = [["ghsa_funding", "true"]];
  }

  // Define queries for typical entityTable page.
  const queries = {
    // Information about the entity
    nodeData: await NodeQuery({ node_id: id }),

    // Project-specific data
    flows: await FlowQuery({
      ...baseFlowQueryParams,
      flow_type_ids: [5]
    }),

    // // Flow bundles (either focus or general depending on the page type)
    // flowBundles: await FlowBundleGeneralQuery(baseQueryParams),

    // General flow bundles by neighbor, for funder/recipient tables.
    flowBundlesByNeighbor: await FlowBundleGeneralQuery({
      ...baseQueryParams,
      by_neighbor: true
    })
  };

  // If "other ID" specified, get its node data as well.
  if (otherId !== undefined) {
    queries["nodeDataOther"] = await NodeQuery({ node_id: otherId });
  }

  // If GHSA page, add additional query to show both top funders and top
  // recipients.
  if (id === "ghsa") {
    queries["flowBundles"] = await FlowBundleGeneralQuery(baseQueryParams);
  } else {
    // Flow bundles (either focus or general depending on the page type)
    queries["flowBundles"] = await FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: true
    });
  }

  // Get results in parallel
  const results = await Util.getQueryResults(queries);
  console.log("results");
  console.log(results);

  // Set the component
  setComponent(
    <EntityTable
      id={id}
      otherId={otherId}
      entityRole={entityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
      setComponent={setComponent}
    />
  );
};

export default EntityTable;
