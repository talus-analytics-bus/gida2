import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./entitytable.module.scss";
import { Settings } from "../../../App.js";
import {
  getWeightsBySummaryAttribute,
  getSummaryAttributeWeightsByNode,
  isUnknownDataOnly
} from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";
import Tab from "../../views/entitytable/content/Tab.js";

// FC for EntityTable.
const EntityTable = ({ id, entityRole, data, flowTypeInfo, ...props }) => {
  // // Get page type from id
  // let pageType;
  // if (id.toLowerCase() === "ghsa") pageType = "ghsa";
  // else if (id.toLowerCase() === "outbreak-response")
  //   pageType = "outbreak-response";
  // else pageType = "entity";
  //
  // // If entity role is not defined, let it be funder as a placeholder.
  // if (entityRole === undefined) entityRole = "funder";
  //
  // Define noun for entity role
  const entityRoleNoun = Util.getRoleTerm({ type: "noun", role: entityRole });

  //
  // // Define other entity role, which is used in certain charts
  // const otherEntityRole = entityRole === "funder" ? "recipient" : "funder";
  //
  // // Define the other node type based on the current entity role, which is used
  // // in certain charts.
  // const otherNodeType = entityRole === "funder" ? "target" : "source";
  // const nodeType = entityRole === "funder" ? "source" : "target";
  //

  //
  // // Get display name for current flow type
  // const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
  //   .display_name;
  //

  // Get master summary
  const masterSummary = data.flowBundles.master_summary;

  // getWeightsBySummaryAttribute({
  //   field: "core_elements",
  //   flowTypes: ["disbursed_funds", "committed_funds", "provided_inkind", "committed_inkind"],
  //   data: [masterSummary]
  // })

  //
  // // Track donut denominator value
  // const getDonutDenominator = data => {
  //   // Assume that first flow bundle is what is needed
  //   const focusNodeBundle = masterSummary;
  //
  //   // Return null if no data
  //   if (focusNodeBundle === undefined) return null;
  //
  //   // Get focus node weight for flow type
  //   const flowTypeBundle = focusNodeBundle.flow_types[curFlowType];
  //
  //   // If data not available, return null
  //   if (flowTypeBundle === undefined) return null;
  //   else {
  //     // otherwise, return the weight
  //     return flowTypeBundle.focus_node_weight;
  //   }
  // };
  // const donutDenominator = getDonutDenominator(data);
  //
  // // Track the Top Recipients/Funders table data
  // const [topTableData, setTopTableData] = React.useState(
  //   getSummaryAttributeWeightsByNode({
  //     data: data.flowBundlesByNeighbor.flow_bundles,
  //     field: "core_elements",
  //     flowTypes: ["disbursed_funds", "committed_funds"],
  //     nodeType: otherNodeType
  //   })
  // );
  //
  // // If on GHSA page, get "other" top table to display.
  // const initTopTableDataOther = true
  //   ? // pageType === "ghsa"
  //     getSummaryAttributeWeightsByNode({
  //       data: data.flowBundlesByNeighbor.flow_bundles,
  //       field: "core_elements",
  //       flowTypes: ["disbursed_funds", "committed_funds"],
  //       nodeType: nodeType
  //     })
  //   : null;
  // const [topTableDataOther, setTopTableDataOther] = React.useState(
  //   initTopTableDataOther
  // );

  console.log("data - EntityTable.js");
  console.log(data);

  // // True if there are no data to show for the entire page, false otherwise.
  const noData = data.flowBundles.flow_bundles[0] === undefined;
  // const noFinancialData = noData
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
        render: val => Util.formatValue(val, match.name),
        defaultContent: Util.formatValue(0, match.name)
      };
    });
  };

  const sections = [
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
      {noData && (
        <span>
          No funding data are currently available where {id} is a{" "}
          {entityRoleNoun}.
        </span>
      )}
    </div>
  );
};

export const renderEntityTable = ({
  component,
  setComponent,
  loading,
  id,
  entityRole,
  flowTypeInfo
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
      flowTypeInfo: flowTypeInfo
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
  flowTypeInfo
}) => {
  const baseQueryParams = {
    focus_node_ids: [id],
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

  // If GHSA page, then filter by GHSA
  if (id === "ghsa")
    baseQueryParams.filters.parent_flow_info_filters = [
      ["ghsa_funding", "true"]
    ];

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
    />
  );
};

export default EntityTable;
