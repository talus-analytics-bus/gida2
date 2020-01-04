import React from "react";
import { Link } from "react-router-dom";
import styles from "./details.module.scss";
import classNames from "classnames";
import { Settings } from "../../../App.js";
import {
  getNodeLinkList,
  getWeightsBySummaryAttributeSimple,
  getSummaryAttributeWeightsByNode,
  isUnknownDataOnly
} from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";

// Content components
import DetailsSection from "../../views/details/content/DetailsSection.js";
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js";
import Donuts from "../../chart/Donuts/Donuts.js";
import StackBar from "../../chart/StackBar/StackBar.js";
import TableInstance from "../../chart/table/TableInstance.js";
import GhsaToggle from "../../misc/GhsaToggle.js";
import EntityRoleToggle from "../../misc/EntityRoleToggle.js";

// FC for Details.
const Details = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  setComponent,
  ...props
}) => {
  // make key changes to the page if the id is special:
  // "ghsa" - Same as normal but include both a top funder and recipient table,
  //          and include only flows that are ghsa. Name of page is
  //          "Global Health Security Agenda (GHSA)" and entityRole is always
  //          funder.
  // "outbreak-response" - TBD

  // Get page type from id
  let pageType;
  if (id.toString().toLowerCase() === "ghsa") pageType = "ghsa";
  else pageType = "entity";

  // If entity role is not defined, let it be funder as a placeholder.
  if (entityRole === undefined) entityRole = "funder";

  // Define noun for entity role
  const entityRoleNoun = Util.getRoleTerm({ type: "noun", role: entityRole });

  // Define other entity role, which is used in certain charts
  const otherEntityRole = entityRole === "funder" ? "recipient" : "funder";

  // Define the other node type based on the current entity role, which is used
  // in certain charts.
  const nodeType = entityRole === "funder" ? "source" : "target";
  const otherNodeType = entityRole === "funder" ? "target" : "source";

  // Track whether viewing committed or disbursed/provided assistance
  const [curFlowType, setCurFlowType] = React.useState("disbursed_funds");

  // Get display name for current flow type
  const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
    .display_name;

  // Get master summary
  const masterSummary = data.flowBundles.master_summary;

  // Track the Top Recipients/Funders table data
  const topTableData = getSummaryAttributeWeightsByNode({
    data: data.flowBundlesFocusOther.flow_bundles,
    field: "core_elements",
    flowTypes: ["disbursed_funds", "committed_funds"],
    nodeType: null
  });

  // If on GHSA page, get "other" top table to display.
  const topTableDataOther =
    pageType === "ghsa"
      ? getSummaryAttributeWeightsByNode({
          data: data.flowBundlesFocus.flow_bundles,
          field: "core_elements",
          flowTypes: ["disbursed_funds", "committed_funds"],
          nodeType: null
        })
      : null;

  // True if there are no data to show for the entire page, false otherwise.
  const noData = data.flowBundles.flow_bundles[0] === undefined;
  const noFinancialData = noData
    ? true
    : masterSummary.flow_types["disbursed_funds"] === undefined &&
      masterSummary.flow_types["committed_funds"] === undefined;

  // True if the only available data to show are for "unknown" values (specific
  // value no reported).
  const unknownDataOnly = isUnknownDataOnly({ masterSummary: masterSummary });

  // Define standard colums for Top Funders and Top Recipients tables.
  const topTableCols = [
    {
      prop: "total",
      func: d => (d[curFlowType] ? d[curFlowType].total : undefined),
      type: "num",
      title: `Total ${
        curFlowType === "disbursed_funds" ? "disbursed" : "committed"
      }`,
      render: v => Util.formatValue(v, "disbursed_funds")
    }
  ].concat(
    [
      ["P", "Prevent"],
      ["D", "Detect"],
      ["R", "Respond"],
      ["O", "Other"],
      ["General IHR", "General IHR Implementation"],
      ["Unspecified", "Unspecified"]
    ].map(c => {
      return {
        func: d => (d[curFlowType] ? d[curFlowType][c[0]] : undefined),
        type: "num",
        title: "Prevent",
        prop: c[1],
        render: v => Util.formatValue(v, "disbursed_funds")
      };
    })
  );

  // Define details content sections.
  const sections = [
    {
      header: (
        <h2>
          Total funds{" "}
          {Util.getRoleTerm({ type: "adjective", role: entityRole })} from{" "}
          {Settings.startYear} to {Settings.endYear}
        </h2>
      ),
      content: (
        <FundsByYear
          id={id}
          entityRole={entityRole}
          data={masterSummary.flow_types}
          unknownDataOnly={unknownDataOnly}
          noFinancialData={noFinancialData}
          flowTypeInfo={flowTypeInfo}
        />
      ),
      toggleFlowType: false,
      hide: noData
    },
    {
      header: <h2>Funding by core element</h2>,
      content: (
        <Donuts
          data={masterSummary}
          flowType={curFlowType}
          attributeType={"core_elements"}
        />
      ),
      toggleFlowType: true,
      hide: noData || unknownDataOnly || noFinancialData
    },
    {
      header: <h2>Funding by core capacity</h2>,
      content: (
        <StackBar
          data={getWeightsBySummaryAttributeSimple({
            field: "core_capacities",
            flowTypes: ["disbursed_funds", "committed_funds"],
            data: data.flowBundles.flow_bundles,
            byOtherNode: true,
            nodeType: nodeType,
            otherNodeType: otherNodeType
          })}
          flowType={curFlowType}
          flowTypeName={curFlowTypeName}
          attributeType={"core_capacities"}
          nodeType={nodeType}
          otherNodeType={otherNodeType}
        />
      ),
      toggleFlowType: true,
      hide: noData || unknownDataOnly || noFinancialData
    },
    {
      header: <h2>Top {otherEntityRole}s</h2>,
      content: (
        <TableInstance
          sortByProp={"total"}
          tableColumns={[
            {
              title: Util.getInitCap(
                Util.getRoleTerm({
                  type: "noun",
                  role: otherEntityRole
                })
              ),
              prop: "focus_node_id",
              type: "text",
              func: d =>
                getNodeLinkList({
                  urlType: "details",
                  nodeList: [d.focus_node_id],
                  entityRole: otherEntityRole,
                  id: id
                })
            }
          ].concat(topTableCols)}
          tableData={
            topTableData
              ? topTableData.filter(d => d[curFlowType] !== undefined)
              : []
          }
        />
      ),
      toggleFlowType: true,
      hide: noData || unknownDataOnly || noFinancialData
    },
    {
      header: <h2>Top {entityRole}s</h2>,
      content: pageType === "ghsa" && (
        <TableInstance
          sortByProp={"total"}
          tableColumns={[
            {
              title: Util.getInitCap(
                Util.getRoleTerm({
                  type: "noun",
                  role: entityRole
                })
              ),
              prop: "focus_node_id",
              type: "text",
              func: d =>
                getNodeLinkList({
                  urlType: "details",
                  nodeList: [d.focus_node_id],
                  entityRole: entityRole,
                  id: id
                })
            }
          ].concat(topTableCols)}
          tableData={
            topTableDataOther
              ? topTableDataOther.filter(d => d[curFlowType] !== undefined)
              : []
          }
        />
      ),
      toggleFlowType: true,
      hide: noData || pageType !== "ghsa" || unknownDataOnly || noFinancialData
    }
  ];

  // Return JSX
  console.log('data.nodeData')
  console.log(data.nodeData)
  return (
    <div className={classNames("pageContainer", styles.details)}>
      <div className={styles.header}>
        <h1>
          {data.nodeData.name}{" "}
          {pageType === "entity" && <span>({entityRoleNoun} profile)</span>}
        </h1>
        {pageType !== "ghsa" && (
          <GhsaToggle ghsaOnly={ghsaOnly} setGhsaOnly={setGhsaOnly} />
        )}
        <EntityRoleToggle
          entityRole={entityRole}
          redirectUrlFunc={v => `/details/${id}/${v}`}
        />
        {pageType !== "ghsa" && (
          <Link to={"/details/ghsa"}>
            <button>GHSA project details</button>
          </Link>
        )}
      </div>
      {sections.map(
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
          )
      )}
      {noData && (
        <span>
          No {ghsaOnly === "true" ? "GHSA-specific " : ""}funding data are
          currently available where {id} is a {entityRoleNoun}.
        </span>
      )}
    </div>
  );
};

export const renderDetails = ({
  detailsComponent,
  setDetailsComponent,
  loading,
  id,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly
}) => {
  if (loading) {
    return <div>Loading...</div>;
  } else if (
    detailsComponent === null ||
    (detailsComponent &&
      (detailsComponent.props.id !== id ||
        detailsComponent.props.entityRole !== entityRole ||
        detailsComponent.props.ghsaOnly !== ghsaOnly))
  ) {
    getComponentData({
      setDetailsComponent: setDetailsComponent,
      id: id,
      entityRole: entityRole,
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly
    });

    return detailsComponent ? detailsComponent : <div />;
  } else {
    return detailsComponent;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for response funding page
 * @method getComponentData
 * @param  {[type]}       setDetailsComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityRole          [description]
 */
const getComponentData = async ({
  setDetailsComponent,
  id,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly
}) => {
  console.log('did it')
  // Define typical base query parameters used in FlowQuery,
  // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
  // modified in code below.
  const nodeType = entityRole === "recipient" ? "target" : "source";
  const otherNodeType = entityRole === "recipient" ? "source" : "target";
  const baseQueryParams = {
    focus_node_ids: [id],
    focus_node_type: nodeType,
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: false,
    filters: id !== "ghsa" ? { flow_attr_filters: [[nodeType + 's', id]] } : {},
    summaries: {
      parent_flow_info_summary: ["core_capacities", "core_elements"],
      datetime_summary: ["year"]
    },
    include_master_summary: true
  };

  // If GHSA page, then filter by GHSA projects.
  if (id === "ghsa" || ghsaOnly === "true")
    baseQueryParams.filters.parent_flow_info_filters = [
      ["ghsa_funding", "true"]
    ];

  // Define queries for typical details page.
  const queries = {
    // Information about the entity
    nodeData: await NodeQuery({ node_id: id }),

    // // Flow bundles (either focus or general depending on the page type)
    // // NOTE: Think this needs to be the commented out thing in the case of GHSA
    // flowBundles: await FlowBundleFocusQuery({
    //   ...baseQueryParams,
    //   by_neighbor: true
    // }),
    // // flowBundles: await FlowBundleGeneralQuery(baseQueryParams),

    // Flow bundles by source/target specific pairing, oriented from the other
    // node type (e.g., for a given source node whose page this is, return one
    // row per target node it has a flow with)
    flowBundlesFocusOther: await FlowBundleFocusQuery({
      ...baseQueryParams,
      focus_node_type: otherNodeType,
      focus_node_ids: null
    })
  };

  // If GHSA page, add additional query to show both top funders and top
  // recipients.
  if (id === "ghsa") {
    queries["flowBundlesFocus"] = await FlowBundleFocusQuery({
      ...baseQueryParams,
      focus_node_type: entityRole === "recipient" ? "target" : "source",
      focus_node_ids: null
    });
    queries["flowBundles"] = await FlowBundleGeneralQuery(baseQueryParams);
  } else {
    // Flow bundles (either focus or general depending on the page type)
    queries["flowBundles"] = await FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: true
    });
  }

  // Get query results.
  const results = await Util.getQueryResults(queries);
  console.log("results - Details.js");
  console.log(results);

  // Feed results and other data to the details component and mount it.
  setDetailsComponent(
    <Details
      id={id}
      entityRole={entityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
      setComponent={setDetailsComponent}
    />
  );
};

export default Details;
