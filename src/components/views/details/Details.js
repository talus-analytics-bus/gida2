import React from "react";
import { Link } from "react-router-dom";
import styles from "./details.module.scss";
import classNames from "classnames";
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
import DetailsSection from "../../views/details/content/DetailsSection.js";
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js";
import Donuts from "../../chart/Donuts/Donuts.js";
import StackBar from "../../chart/StackBar/StackBar.js";
import SimpleTable from "../../chart/table/SimpleTable.js";
import GhsaToggle from "../../misc/GhsaToggle.js";

// FC for Details.
const Details = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
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
  if (id.toLowerCase() === "ghsa") pageType = "ghsa";
  else if (id.toLowerCase() === "outbreak-response")
    pageType = "outbreak-response";
  else pageType = "entity";

  // If entity role is not defined, let it be funder as a placeholder.
  if (entityRole === undefined) entityRole = "funder";

  // Define noun for entity role
  const entityRoleNoun = Util.getRoleTerm({ type: "noun", role: entityRole });

  // Define other entity role, which is used in certain charts
  const otherEntityRole = entityRole === "funder" ? "recipient" : "funder";

  // Define the other node type based on the current entity role, which is used
  // in certain charts.
  const otherNodeType = entityRole === "funder" ? "target" : "source";
  const nodeType = entityRole === "funder" ? "source" : "target";

  // Track whether viewing committed or disbursed/provided assistance
  const [curFlowType, setCurFlowType] = React.useState("disbursed_funds");

  // Get display name for current flow type
  const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
    .display_name;

  // Get master summary
  const masterSummary = data.flowBundles.master_summary;

  // Track data for donuts
  const [donutData] = React.useState(
    getWeightsBySummaryAttribute({
      field: "core_elements",
      flowTypes: ["disbursed_funds", "committed_funds"],
      data: [masterSummary]
    })
  );

  // Track donut denominator value
  const getDonutDenominator = data => {
    // Assume that first flow bundle is what is needed
    const focusNodeBundle = masterSummary;

    // Return null if no data
    if (focusNodeBundle === undefined) return null;

    // Get focus node weight for flow type
    const flowTypeBundle = focusNodeBundle.flow_types[curFlowType];

    // If data not available, return null
    if (flowTypeBundle === undefined) return null;
    else {
      // otherwise, return the weight
      return flowTypeBundle.focus_node_weight;
    }
  };
  const donutDenominator = getDonutDenominator(data);

  // Track the Top Recipients/Funders table data
  const [topTableData] = React.useState(
    getSummaryAttributeWeightsByNode({
      data: data.flowBundlesByNeighbor.flow_bundles,
      field: "core_elements",
      flowTypes: ["disbursed_funds", "committed_funds"],
      nodeType: "focus_node_id"
    })
  );

  // If on GHSA page, get "other" top table to display.
  const initTopTableDataOther =
    pageType === "ghsa"
      ? getSummaryAttributeWeightsByNode({
          data: data.flowBundlesByNeighborOther.flow_bundles,
          field: "core_elements",
          flowTypes: ["disbursed_funds", "committed_funds"],
          nodeType: "focus_node_id"
        })
      : null;
  const [topTableDataOther] = React.useState(initTopTableDataOther);
  console.log("data - Details.js");
  console.log(data);

  console.log("topTableDataOther");
  console.log(topTableDataOther);

  // True if there are no data to show for the entire page, false otherwise.
  const noData = data.flowBundles.flow_bundles[0] === undefined;
  const noFinancialData = noData
    ? true
    : masterSummary.flow_types["disbursed_funds"] === undefined &&
      masterSummary.flow_types["committed_funds"] === undefined;

  // True if the only available data to show are for "unknown" values (specific
  // value no reported).
  const unknownDataOnly = isUnknownDataOnly({ masterSummary: masterSummary });

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
          data={masterSummary}
          unknownDataOnly={unknownDataOnly}
          noFinancialData={noFinancialData}
        />
      ),
      toggleFlowType: false,
      hide: noData
    },
    {
      header: <h2>Funding by core element</h2>,
      content: (
        <Donuts
          data={donutData}
          flowType={curFlowType}
          attributeType={"core_elements"}
          donutDenominator={donutDenominator}
        />
      ),
      toggleFlowType: true,
      hide: noData || unknownDataOnly || noFinancialData
    },
    {
      header: <h2>Funding by core capacity</h2>,
      content: (
        <StackBar
          data={getWeightsBySummaryAttribute({
            field: "core_capacities",
            flowTypes: ["disbursed_funds", "committed_funds"],
            data: data.flowBundlesByNeighbor.flow_bundles,
            byOtherNode: true,
            otherNodeType: otherNodeType
          })}
          flowType={curFlowType}
          flowTypeName={curFlowTypeName}
          attributeType={"core_capacities"}
          otherNodeType={otherNodeType}
        />
      ),
      toggleFlowType: true,
      hide: noData || unknownDataOnly || noFinancialData
    },
    {
      header: <h2>Top {otherEntityRole}s</h2>,
      content: (
        <SimpleTable
          colInfo={[
            {
              fmtName: otherNodeType,
              get: d => d.focus_node_id,
              // get: d => d[otherNodeType],
              display_name: Util.getInitCap(
                Util.getRoleTerm({
                  type: "noun",
                  role: otherEntityRole
                })
              )
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].total : undefined),
              display_name: `Total ${
                curFlowType === "disbursed_funds" ? "disbursed" : "committed"
              }`
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].P : undefined),
              display_name: "Prevent"
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].D : undefined),
              display_name: "Detect"
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].R : undefined),
              display_name: "Respond"
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].O : undefined),
              display_name: "Other"
            },
            {
              fmtName: curFlowType,
              get: d =>
                d[curFlowType]
                  ? d[curFlowType]["General IHR Implementation"]
                  : undefined,
              display_name: "General IHR"
            },
            {
              fmtName: curFlowType,
              get: d =>
                d[curFlowType] ? d[curFlowType]["Unspecified"] : undefined,
              display_name: "Unspecified"
            }
          ]}
          data={topTableData}
          hide={d => {
            return d[curFlowType] !== undefined;
          }}
        />
      ),
      toggleFlowType: true,
      hide: noData || unknownDataOnly || noFinancialData
    },
    {
      header: <h2>Top {entityRole}s</h2>,
      content: (
        <SimpleTable
          colInfo={[
            {
              fmtName: nodeType,
              get: d => d.focus_node_id,
              display_name: Util.getInitCap(
                Util.getRoleTerm({
                  type: "noun",
                  role: entityRole
                })
              )
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].total : undefined),
              display_name: `Total ${
                curFlowType === "disbursed_funds" ? "disbursed" : "committed"
              }`
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].P : undefined),
              display_name: "Prevent"
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].D : undefined),
              display_name: "Detect"
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].R : undefined),
              display_name: "Respond"
            },
            {
              fmtName: curFlowType,
              get: d => (d[curFlowType] ? d[curFlowType].O : undefined),
              display_name: "Other"
            },
            {
              fmtName: curFlowType,
              get: d =>
                d[curFlowType]
                  ? d[curFlowType]["General IHR Implementation"]
                  : undefined,
              display_name: "General IHR"
            },
            {
              fmtName: curFlowType,
              get: d =>
                d[curFlowType] ? d[curFlowType]["Unspecified"] : undefined,
              display_name: "Unspecified"
            }
          ]}
          data={topTableDataOther}
          hide={d => {
            return d[curFlowType] !== undefined;
          }}
        />
      ),
      toggleFlowType: true,
      hide: noData || pageType !== "ghsa" || unknownDataOnly || noFinancialData
    }
  ];

  // Return JSX
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
    (detailsComponent && detailsComponent.props.id !== id)
  ) {
    getDetailsData({
      setDetailsComponent: setDetailsComponent,
      id: id,
      entityRole: entityRole,
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly
    });

    return <div />;
  } else {
    return detailsComponent;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for special detail pages like GHSA and response
 * @method getDetailsData
 * @param  {[type]}       setDetailsComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityRole          [description]
 */
const getDetailsData = async ({
  setDetailsComponent,
  id,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly
}) => {
  // Define typical base query parameters used in FlowQuery,
  // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
  // modified in code below.
  const nodeType = entityRole === "recipient" ? "target" : "source";
  const baseQueryParams = {
    focus_node_ids: [id],
    focus_node_type: entityRole === "recipient" ? "target" : "source",
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: false,
    filters: id !== "ghsa" ? { flow_attr_filters: [[nodeType, id]] } : {},
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

  // Define queries for typical details page.
  const queries = {
    // Information about the entity
    nodeData: await NodeQuery({ node_id: id }),

    // Flow bundles
    flowBundles: await Query(baseQueryParams)
  };

  // If GHSA page, add additional query to show both top funders and top
  // recipients.
  if (id === "ghsa") {
    queries["flowBundlesByNeighborOther"] = await FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: false,
      focus_node_type: entityRole === "recipient" ? "target" : "source",
      focus_node_ids: null
    });

    queries["flowBundlesByNeighbor"] = await FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: false,
      focus_node_type: entityRole === "recipient" ? "source" : "target",
      focus_node_ids: null
    });
  } else {
    queries["flowBundlesByNeighbor"] = await FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: false,
      focus_node_type: entityRole === "recipient" ? "source" : "target",
      focus_node_ids: null
    });
  }

  // Get query results.
  const results = await Util.getQueryResults(queries);

  // Feed results and other data to the details component and mount it.
  setDetailsComponent(
    <Details
      id={id}
      entityRole={entityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
    />
  );
};

export default Details;
