import React from "react";
import styles from "./mapviewer.module.scss";
import EntityRoleToggle from "../../../../misc/EntityRoleToggle.js";
import { Settings } from "../../../../../App.js";
import Util from "../../../../misc/Util.js";
import FlowBundleFocusQuery from "../../../../misc/FlowBundleFocusQuery.js";

// Local content components
import Map from "./content/Map.js";

// FC for MapViewer.
const MapViewer = ({
  data,
  entityRole,
  setEntityRole,
  minYear,
  maxYear,
  ...props
}) => {
  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = React.useState("committed");

  // Track support type selected for the map
  const [supportType, setSupportType] = React.useState("funds");

  /**
   * Given the transaction type and the support type, returns the flow type.
   * @method getFlowTypeFromArgs
   * @param  {[type]}            transactionType [description]
   * @param  {[type]}            supportType     [description]
   * @return {[type]}                            [description]
   */
  const getFlowTypeFromArgs = ({ transactionType, supportType }) => {
    if (transactionType === "disbursed") {
      switch (supportType) {
        case "inkind":
          return "provided_inkind";
        case "funds":
        default:
          return "disbursed_funds";
      }
    } else if (transactionType === "committed") {
      switch (supportType) {
        case "inkind":
          return "committed_inkind";
        case "funds":
        default:
          return "committed_funds";
      }
    }
  };

  // Get flow type
  const flowType = getFlowTypeFromArgs({
    transactionType: transactionType,
    supportType: supportType
  });

  // TODO:
  // header with title and funder/recipient toggle
  // map
  // map controls (zoom, reset)
  // legend (maybe part of map?)
  // options / tooltip
  return (
    <div className={styles.mapViewer}>
      <div className={styles.header}>
        <div className={styles.labels}>
          <div>Map title placeholder</div>
          <div>Map flow type placeholder</div>
        </div>
        <div className={styles.toggle}>
          <EntityRoleToggle entityRole={entityRole} callback={setEntityRole} />
        </div>
      </div>
      <div className={styles.content}>
        <Map
          entityRole={entityRole}
          flowType={flowType}
          data={data.flowBundlesMap.flow_bundles}
          minYear={minYear}
          maxYear={maxYear}
        />
      </div>
    </div>
  );
};

export const renderMapViewer = ({
  component,
  setComponent,
  loading,
  id,
  entityRole,
  setEntityRole,
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
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly,
      entityRole: entityRole,
      setEntityRole: setEntityRole,
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
  setEntityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
  // Define typical base query parameters used in FlowQuery,
  // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
  // modified in code below.
  const nodeType = entityRole === "recipient" ? "target" : "source";
  const baseQueryParams = {
    focus_node_ids: null,
    focus_node_type: nodeType,
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${props.minYear}-01-01`, // TODO check these two
    end_date: `${props.maxYear}-12-31`,
    by_neighbor: false,
    filters: {},
    summaries: {},
    include_master_summary: false
  };

  // If core capacity filters provided, use those
  if (props.coreCapacities.length > 0) {
    baseQueryParams.filters.parent_flow_info_filters = [
      ["core_capacities"].concat(props.coreCapacities)
    ];
  }

  // If outbreak response filters provided, use those
  // TODO
  if (props.outbreakResponses.length > 0) {
    baseQueryParams.filters.parent_flow_info_filters = [
      "outbreak_responses"
    ].concat(props.outbreakResponses);
  }

  // If GHSA page, then filter by GHSA projects.
  if (id === "ghsa" || ghsaOnly === "true")
    baseQueryParams.filters.parent_flow_info_filters = [
      ["ghsa_funding", "true"]
    ];

  // Define queries for typical details page.
  const queries = {
    // Information about the entity
    flowBundlesMap: await FlowBundleFocusQuery({
      ...baseQueryParams,
      node_category: ["country"]
    })
  };

  // Get query results.
  const results = await Util.getQueryResults(queries);
  console.log("results - MapViewer.js");
  console.log(results);

  // Feed results and other data to the details component and mount it.
  setComponent(
    <MapViewer
      id={id}
      entityRole={entityRole}
      setEntityRole={setEntityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
      setComponent={setComponent}
      activeTab={props.activeTab}
      minYear={props.minYear}
      maxYear={props.maxYear}
      setMinYear={props.setMinYear}
      setMaxYear={props.setMaxYear}
      coreCapacities={props.coreCapacities}
      setCoreCapacities={props.setCoreCapacities}
      outbreakResponses={props.outbreakResponses}
      setOutbreakResponses={props.setOutbreakResponses}
    />
  );
};

export default MapViewer;
