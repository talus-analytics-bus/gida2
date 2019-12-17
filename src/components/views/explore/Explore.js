import React from "react";
import { Link } from "react-router-dom";
import styles from "./explore.module.scss";
import classNames from "classnames";
import { Settings } from "../../../App.js";
// import {
//   getNodeLinkList,
//   getWeightsBySummaryAttributeSimple,
//   getSummaryAttributeWeightsByNode,
//   isUnknownDataOnly
// } from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";

// Content components
import GhsaToggle from "../../misc/GhsaToggle.js";
import EntityRoleToggle from "../../misc/EntityRoleToggle.js";

// FC for Explore.
const Explore = ({
  activeTab,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
  // Returns correct header content given the active tab
  const getHeaderData = tab => {
    if (tab === "org") {
      return {
        header: "EXPLORE ORGANIZATION FUNDERS AND RECIPIENTS",
        instructions: "Choose organization in table to view details."
      };
    } else if (tab === "map") {
      return {
        header: "EXPLORE COUNTRIES ON A MAP",
        instructions: "Choose country on map to view details."
      };
    }
  };
  const headerData = getHeaderData(activeTab);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.explore)}>
      <div className={styles.header}>
        <h1>{headerData.header}</h1>
        <span>{headerData.instructions}</span>
        <div className={styles.controls}>
          <div className={styles.tabs} />
          <div className={styles.buttons}>
            <Link to={"/details/ghsa"}>
              <button>GHSA project details</button>
            </Link>
            <button>Dark</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const renderExplore = ({
  component,
  setComponent,
  loading,
  id,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
  if (loading) {
    return <div>Loading...</div>;
  } else if (
    component === null ||
    (component &&
      (component.props.id !== id ||
        component.props.entityRole !== entityRole ||
        component.props.ghsaOnly !== ghsaOnly))
  ) {
    getComponentData({
      setComponent: setComponent,
      id: id,
      entityRole: entityRole,
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly,
      ...props
    });

    return component ? component : <div />;
  } else {
    return component;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for response funding page
 * @method getComponentData
 * @param  {[type]}       setComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityRole          [description]
 */
const getComponentData = async ({
  setComponent,
  id,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
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
  setComponent(
    <Explore
      id={id}
      entityRole={entityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
      setComponent={setComponent}
      activeTab={props.activeTab}
    />
  );
};

export default Explore;
