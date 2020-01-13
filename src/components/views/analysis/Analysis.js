import React from "react";
import styles from "./analysis.module.scss";
import GhsaToggle from "../../misc/GhsaToggle.js";
import RadioToggle from "../../misc/RadioToggle.js";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import TimeSlider from "../../misc/TimeSlider.js";
import CoreCapacityDropdown from "../../misc/CoreCapacityDropdown.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import Chord from "./content/Chord.js";

// FC for Analysis.
const Analysis = ({ data, ghsaOnly, setGhsaOnly, flowTypeInfo, ...props }) => {
  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = React.useState("committed");

  // Track min and max year of data (consistent across tabs)
  const [minYear, setMinYear] = React.useState(Settings.startYear);
  const [maxYear, setMaxYear] = React.useState(Settings.endYear);

  // Set value filters
  const [coreCapacities, setCoreCapacities] = React.useState([]);

  // Get flow type
  const flowType =
    transactionType === "committed" ? "committed_funds" : "disbursed_funds";

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo.find(ft => ft.name === flowType)
    .display_name;

  // legend (maybe part of map?)
  return (
    <div className={styles.analysis}>
      <div className={styles.header}>
        <div className={styles.labels}>
          <div>International funding network</div>
        </div>
      </div>
      <div className={styles.content}>
        {<Chord data={data.flowBundlesGeneral.flow_bundles} />}
      </div>
      <div className={styles.menu}>
        <GhsaToggle ghsaOnly={ghsaOnly} setGhsaOnly={setGhsaOnly} />
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
  ghsaOnly
}) => {
  const remount = component.props.ghsaOnly !== ghsaOnly;
  return remount;
};

export const renderAnalysis = ({
  component,
  setComponent,
  loading,
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
      remountComponent({
        component: component,
        props: props,
        ghsaOnly: ghsaOnly
        // coreCapacities: props.coreCapacities,
        // minYear: props.minYear,
        // maxYear: props.maxYear
      }))
  ) {
    getComponentData({
      setComponent: setComponent,
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
    flow_type_ids: [1, 2],
    start_date: `${props.minYear}-01-01`, // TODO check these two
    end_date: `${props.maxYear}-12-31`,
    by_neighbor: false,
    filters: {},
    summaries: {},
    include_master_summary: false,
    single_source_and_target: true
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
      ["ghsa_funding", "True"]
    ];

  // Define queries for typical details page.
  const queries = {
    // Information about the entity
    flowBundlesGeneral: FlowBundleGeneralQuery({
      ...baseQueryParams
    })
  };

  // Get query results.
  const results = await Util.getQueryResults(queries);
  console.log("results - Analysis.js");
  console.log(results);

  // Feed results and other data to the details component and mount it.
  setComponent(
    <Analysis
      id={id}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
      setComponent={setComponent}
      activeTab={props.activeTab}
      outbreakResponses={props.outbreakResponses}
      setOutbreakResponses={props.setOutbreakResponses}
    />
  );
};

export default Analysis;
