import React from "react";
import styles from "./mapviewer.module.scss";
import EntityRoleToggle from "../../../../misc/EntityRoleToggle.js";
import GhsaToggle from "../../../../misc/GhsaToggle.js";
import RadioToggle from "../../../../misc/RadioToggle.js";
import { Settings } from "../../../../../App.js";
import Util from "../../../../misc/Util.js";
import TimeSlider from "../../../../misc/TimeSlider.js";
import CoreCapacityDropdown from "../../../../misc/CoreCapacityDropdown.js";
import FlowBundleFocusQuery from "../../../../misc/FlowBundleFocusQuery.js";

// Local content components
import Map from "./content/Map.js";

// FC for MapViewer.
const MapViewer = ({
  data,
  entityRole,
  setEntityRole,
  ghsaOnly,
  setGhsaOnly,
  minYear,
  setMaxYear,
  setMinYear,
  maxYear,
  coreCapacities,
  setCoreCapacities,
  flowTypeInfo,
  ...props
}) => {
  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = React.useState("committed");

  // Track support type selected for the map
  const [supportType, setSupportType] = React.useState("funds");

  // Track main map title
  const [mapTitle, setMapTitle] = React.useState("funds");

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

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo.find(ft => ft.name === flowType)
    .display_name;

  const getMapTitle = ({ supportType, entityRole }) => {
    if (supportType === "funds" || supportType === "inkind") {
      if (entityRole === "recipient") {
        return "Recipients by country";
      } else return "Funders by country";
    } else if (supportType === "jee") {
      return "JEE score by country";
    } else if (supportType === "needs_met") {
      return "Combined financial resources and need metric";
    } else return "[Error] Unknown map metric";
  };

  // Get whether metric has transaction type
  const metricHasTransactionType = ["funds", "inkind"].includes(supportType);

  // TODO:
  // map
  // map controls (zoom, reset)
  // legend (maybe part of map?)
  return (
    <div className={styles.mapViewer}>
      <div className={styles.header}>
        <div className={styles.labels}>
          <div>{getMapTitle({ supportType, entityRole })}</div>
          {metricHasTransactionType && <div>{flowTypeDisplayName}</div>}
        </div>
        <div className={styles.toggle}>
          <EntityRoleToggle entityRole={entityRole} callback={setEntityRole} />
        </div>
      </div>
      <div className={styles.content}>
        <Map
          supportType={supportType}
          entityRole={entityRole}
          flowType={flowType}
          data={data.flowBundlesMap.flow_bundles}
          minYear={minYear}
          maxYear={maxYear}
          coreCapacities={coreCapacities}
        />
      </div>
      <div className={styles.menu}>
        <GhsaToggle ghsaOnly={ghsaOnly} setGhsaOnly={setGhsaOnly} />
        {metricHasTransactionType && (
          <RadioToggle
            label={"Choose"}
            callback={setTransactionType}
            curVal={transactionType}
            choices={[
              {
                name: "Committed",
                value: "committed"
              },
              {
                name: "Disbursed",
                value: "disbursed"
              }
            ]}
          />
        )}
        <RadioToggle
          label={"Click to show"}
          callback={setSupportType}
          curVal={supportType}
          choices={[
            {
              name: "Financial support",
              value: "funds"
            },
            {
              name: "In-kind support",
              value: "inkind",
              tooltip:
                "In-kind support is the contribution of goods or services to a recipient. Examples of in-kind support include providing technical expertise or programming support, or supporting GHSA action packages."
            },
            {
              name: "JEE score",
              value: "jee",
              tooltip:
                "The Joint External Evaluation tool (JEE) measures country-specific progress in developing the capacities needed to prevent, detect, and respond to public health threats."
            },
            {
              name: "Combined financial resources and need metric",
              value: "needs_met",
              tooltip:
                "This metric combines both a country's JEE scores and the amount of disbursed funds that the country has received. We use JEE scores as a proxy for country-specific needs, and calculate the ratio of financial resources to need. The goal of this metric is to highlight areas whose needs may still be unmet based on their ratio of financial resources to need."
            }
          ]}
        />
        {
          // TODO: add this tooltip for CC dropdown
          // Core capacities were tagged based on names and descriptions of commitments and disbursements. A single commitment or disbursement may support more than one core capacity. Additional information on how core capacities were tagged can be found on the data definitions page.
        }
        <CoreCapacityDropdown
          onChange={vals => {
            setCoreCapacities(vals.map(v => v.value));
          }}
        />
        <TimeSlider
          hide={supportType === "jee"}
          minYearDefault={Settings.startYear}
          maxYearDefault={Settings.endYear}
          onAfterChange={years => {
            setMinYear(years[0]);
            setMaxYear(years[1]);
          }}
        />
      </div>
    </div>
  );
};

const remountComponent = ({
  component,
  minYear,
  maxYear,
  props,
  id,
  entityRole,
  ghsaOnly
}) => {
  const remount =
    component.props.minYear !== minYear ||
    component.props.maxYear !== maxYear ||
    component.props.entityRole !== entityRole ||
    component.props.ghsaOnly !== ghsaOnly ||
    component.props.coreCapacities.toString() !==
      props.coreCapacities.toString();
  console.log("remount = " + remount);
  return remount;
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
  // Set IDs
  id = parseInt(id);

  if (loading) {
    return <div>Loading...</div>;
  } else if (
    component === null ||
    (component &&
      remountComponent({
        component: component,
        props: props,
        id: id,
        entityRole: entityRole,
        ghsaOnly: ghsaOnly,
        minYear: props.minYear,
        maxYear: props.maxYear
      }))
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
  console.log("Getting mapViewer component data");
  // Define queries for typical details page.
  const queries = {
    // Information about the entity
    flowBundlesMap: FlowBundleFocusQuery({
      ...baseQueryParams
      // node_category: ["country"]
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
