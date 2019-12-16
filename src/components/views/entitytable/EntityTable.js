import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./entitytable.module.scss";
import { Settings } from "../../../App.js";
import { getWeightsBySummaryAttribute } from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";
import Tab from "../../views/entitytable/content/Tab.js";
import GhsaToggle from "../../misc/GhsaToggle.js";

// FC for EntityTable.
const EntityTable = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
  // Get page type from id
  let pageType;
  if (id.toLowerCase() === "ghsa") pageType = "ghsa";
  else if (id.toLowerCase() === "outbreak-response")
    pageType = "outbreak-response";
  else pageType = "entity";

  // // If entity role is not defined, let it be funder as a placeholder.
  // if (entityRole === undefined) entityRole = "funder";

  // Define noun for entity role
  const entityRoleNoun = Util.getRoleTerm({ type: "noun", role: entityRole });

  // Get master summary
  const masterSummary = data.flowBundles.master_summary;
  console.log("data - EntityTable.js");
  console.log(data);

  // // True if there are no data to show for the entire page, false otherwise.
  const noData = data.flowBundles.flow_bundles[0] === undefined;
  //   ? true
  //   : masterSummary.flow_types["disbursed_funds"] === undefined &&
  //     masterSummary.flow_types["committed_funds"] === undefined;
  //
  // const unknownDataOnly = isUnknownDataOnly({ masterSummary: masterSummary });

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
        title: `${match.display_name} (${Settings.startYear}-${
          Settings.endYear
        })`,
        prop: match.name,
        render: val => Util.formatValue(val, match.name)
        // defaultContent: "n/a"
      };
    });
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
              func: d => d.source.join("; ")
            },
            {
              title: "Recipient",
              prop: "target",
              type: "text",
              func: d => d.target.join("; ")
            },
            {
              title: "Project name",
              func: d => d.flow_info.project_name,
              type: "text",
              prop: "project_name"
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
          tableData={data.flows.filter(f =>
            f.flow_info.assistance_type.toLowerCase().includes("financial")
          )}
        />
      )
    },
    {
      header: "Funds by core element",
      slug: "ce",
      content: (
        <TableInstance
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
    }
  ];

  // Track currently visible tab
  const [curTab, setCurTab] = React.useState(sections[0].slug);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.entityTable)}>
      <div className={styles.header}>
        {pageType !== "ghsa" && (
          <GhsaToggle ghsaOnly={ghsaOnly} setGhsaOnly={setGhsaOnly} />
        )}
        <h1>{data.nodeData.name}</h1>
        <Link to={`/details/${id}/${entityRole}`}>
          <button>Back to summary</button>
        </Link>
      </div>
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
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly
}) => {
  // Get data
  // FundsByYear, FundsByCoreElement:
  // http://localhost:5002/flow_bundles?focus_node_type=source&focus_node_ids=United%20States&flow_type_ids=1%2C2%2C3%2C4&by_neighbor=false

  if (loading) {
    return <div>Loading...</div>;
  } else if (component === null || (component && component.props.id !== id)) {
    getComponentData({
      setComponent: setComponent,
      id: id,
      entityRole: entityRole,
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly
    });

    return <div />;
  } else {
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
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly
}) => {
  const baseQueryParams = {
    focus_node_ids: id !== "ghsa" ? [id] : null,
    focus_node_type: entityRole === "recipient" ? "target" : "source",
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: false,
    filters: {},
    summaries: {
      parent_flow_info_summary: ["core_capacities", "core_elements"],
      datetime_summary: ["year"]
    },
    include_master_summary: true
  };

  const baseFlowQueryParams = JSON.parse(JSON.stringify(baseQueryParams));

  // If GHSA page, then filter by GHSA
  if (id === "ghsa" || ghsaOnly === "true") {
    baseQueryParams.filters.parent_flow_info_filters = [
      ["ghsa_funding", "true"]
    ];
    baseFlowQueryParams.filters.flow_info_filters = [["ghsa_funding", "true"]];
  }

  /**
   * Given a unique ID, returns the correct query component to provide Details
   * page data.
   * @method getQueryComponentFromId
   * @param  {[type]}                id [description]
   * @return {[type]}                   [description]
   */
  const getQueryComponentFromId = id => {
    switch (id) {
      case "ghsa":
        return FlowBundleGeneralQuery;
      default:
        return FlowBundleFocusQuery;
    }
  };

  // Get appropriate query component based on what ID the details page has.
  const Query = getQueryComponentFromId(id);

  const queries = {
    nodeData: await NodeQuery({ node_id: id }),
    flows: await FlowQuery({
      ...baseFlowQueryParams,
      flow_type_ids: [5]
    }),
    flowBundles: await Query(baseQueryParams),
    flowBundlesByNeighbor: await Query({
      ...baseQueryParams,
      by_neighbor: true
    })
  };

  // Get results in parallel
  const results = await Util.getQueryResults(queries);

  // Set the component
  setComponent(
    <EntityTable
      id={id}
      entityRole={entityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
    />
  );
};

export default EntityTable;
