import React from "react";
import classNames from "classnames";
import styles from "./analysis.module.scss";
import GhsaToggle from "../../misc/GhsaToggle.js";
import RadioToggle from "../../misc/RadioToggle.js";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import TimeSlider from "../../misc/TimeSlider.js";
import FilterDropdown from "../../common/FilterDropdown/FilterDropdown.js";
import TableInstance from "../../chart/table/TableInstance.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import Chord from "./content/Chord.js";
import Search from "../../common/Search/Search.js";
import axios from "axios";
import { Link } from "react-router-dom";
import { core_capacities } from "../../misc/Data.js";

// FC for Analysis.
const Analysis = ({
  data,
  ghsaOnly,
  setGhsaOnly,
  flowTypeInfo,
  coreCapacities,
  setCoreCapacities,
  setMinYear,
  setMaxYear,
  ...props
}) => {
  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = React.useState("committed");
  const [chordComponent, setChordComponent] = React.useState(null);
  const [selectedEntity, setSelectedEntity] = React.useState(null);
  const [selectedEntityInfo, setSelectedEntityInfo] = React.useState(null);
  const [entityArcInfo, setEntityArcInfo] = React.useState(null);
  const [showInfo, setShowInfo] = React.useState(false);

  // Get flow type
  const flowType =
    transactionType === "committed" ? "committed_funds" : "disbursed_funds";

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo.find(ft => ft.name === flowType)
    .display_name;

  // Get top funder table and top recipient table
  const tableInstances = [];

  const tables = [
    ["Top funders", "Funder", "source", "flowBundlesFocusSources"],
    ["Top recipients", "Recipient", "target", "flowBundlesFocusTargets"]
  ];

  React.useEffect(() => {
    if (selectedEntity === null) {
      setShowInfo(false);
      setSelectedEntityInfo(null);
    } else {
      setShowInfo(true);
      setSelectedEntityInfo(
        entityArcInfo.find(d => d.data.id === selectedEntity)
      );
      // axios(`${Util.API_URL}/place`, {
      //   params: { id: selectedEntity }
      // }).then(d => {
      //   setSelectedEntityInfo(d.data[0]);
      // });
    }
  }, [selectedEntity]);

  const transactionTypeNoun =
    transactionType === "committed" ? "commitments" : "disbursements";

  const info = selectedEntity && showInfo && selectedEntityInfo && (
    <div style={{ display: showInfo }} className={styles.info}>
      <div className={styles.header}>
        <div className={styles.name}>{selectedEntityInfo.name}</div>
        <button onClick={() => setSelectedEntity(null)}>Close</button>
      </div>
      <div className={styles.content}>
        <div className={styles.metric}>
          <div className={styles.value}>
            {Util.money(selectedEntityInfo.source)}
          </div>
          <div className={styles.label}>Total {transactionTypeNoun} funded</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.value}>
            {Util.money(selectedEntityInfo.target)}
          </div>
          <div className={styles.label}>
            Total {transactionTypeNoun} received
          </div>
        </div>
        {true && (
          <div>
            <Link to={`/details/${selectedEntityInfo.data.id}/funder`}>
              <button>View funder profile</button>
            </Link>
            <Link to={`/details/${selectedEntityInfo.data.id}/recipient`}>
              <button>View recipient profile</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  tables.forEach(table => {
    tableInstances.push(
      <div>
        <h2>{table[0]}</h2>
        <TableInstance
          paging={true}
          tableColumns={[
            {
              title: table[1],
              prop: table[2],
              type: "text",
              func: d => d[table[2]][0].name
            },
            {
              title: "Committed",
              prop: "committed_funds",
              type: "num",
              func: d =>
                d.flow_types.committed_funds !== undefined
                  ? d.flow_types.committed_funds.focus_node_weight
                  : "",
              render: d => Util.formatValue(d, "committed_funds")
            },
            {
              title: "Disbursed",
              prop: "disbursed_funds",
              type: "num",
              func: d =>
                d.flow_types.disbursed_funds !== undefined
                  ? d.flow_types.disbursed_funds.focus_node_weight
                  : "",
              render: d => Util.formatValue(d, "disbursed_funds")
            }
          ]}
          tableData={data[table[3]].flow_bundles}
          sortByProp={"disbursed_funds"}
          limit={10}
          noNativePaging={true}
          noNativeSearch={true}
        />
      </div>
    );
  });

  // const chordContent = renderChord({
  //   component: chordComponent,
  //   setComponent: setChordComponent,
  //   flowTypeInfo: flowTypeInfo,
  //   transactionType: transactionType,
  //   ghsaOnly: ghsaOnly,
  //   setGhsaOnly: setGhsaOnly,
  //   coreCapacities: coreCapacities,
  //   setCoreCapacities: setCoreCapacities,
  //   minYear: minYear,
  //   setMinYear: setMinYear,
  //   maxYear: maxYear,
  //   setMaxYear: setMaxYear
  // });

  const chordContent = (
    <Chord
      chordData={data.flowBundlesGeneral.flow_bundles}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
      activeTab={props.activeTab}
      outbreakResponses={props.outbreakResponses}
      coreCapacities={coreCapacities}
      minYear={props.minYear}
      maxYear={props.maxYear}
      transactionType={transactionType}
      selectedEntity={selectedEntity}
      setSelectedEntity={setSelectedEntity}
      setEntityArcInfo={setEntityArcInfo}
      setShowInfo={setShowInfo}
    />
  );

  // legend (maybe part of map?)
  return (
    <div className={classNames(styles.analysis, "pageContainer")}>
      <div className={styles.content}>
        <h1>International funding network</h1>
        <p>
          The figure below illustrates the flow of funds from funder to
          recipient. Countries and non-country funders are grouped along the
          outside of the circle, and lines through the center of the circle
          correspond to the transfer of funds from funder to recipient. Thicker
          lines represent larger amounts of funding commitments or
          disbursements. Hover over any line to see additional details on the
          funding amount or funders and recipients involved. Amounts shown here
          may differ from those shown elsewhere in this site because additional,
          estimated commitments and disbursements are included to enable
          visualization of more reported funding flows.
        </p>
        <div className={styles.chordDiagram}>
          {chordContent}
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
            <FilterDropdown
              {...{
                className: [styles.italic],
                label: "IHR core capacity",
                openDirection: "down",
                options: core_capacities,
                placeholder: "Select core capacities",
                onChange: v => setCoreCapacities(v.map(d => d.value)),
                curValues: coreCapacities
              }}
            />
            <Search callback={setSelectedEntity} expandedDefault={true} />
            <TimeSlider
              minYearDefault={Settings.startYear}
              maxYearDefault={Settings.endYear}
              onAfterChange={years => {
                setMinYear(years[0]);
                setMaxYear(years[1]);
              }}
            />
            {info}
          </div>
        </div>
        <h1>International funding by funder/recipient</h1>
        <p>
          The tables below identify the funders that have committed the most
          funds, and the recipients that have recieved the most funds. Click on
          any entry in the tables for additional detail on that funder or
          recipient's activities. For information on a funder or recipient not
          included on this list, search for that country or organization below.
        </p>
        {<div className={styles.tables}>{tableInstances.map(d => d)}</div>}
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
  ghsaOnly,
  coreCapacities
}) => {
  const remount =
    component.props.minYear !== minYear ||
    component.props.maxYear !== maxYear ||
    component.props.ghsaOnly !== ghsaOnly ||
    component.props.coreCapacities.toString() !== coreCapacities.toString();
  return remount;
};

export const renderAnalysis = ({
  component,
  setComponent,
  loading,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  setCoreCapacities,
  coreCapacities,
  minYear,
  setMinYear,
  setMaxYear,
  maxYear,
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
        ghsaOnly: ghsaOnly,
        coreCapacities: coreCapacities,
        minYear: minYear,
        maxYear: maxYear
      }))
  ) {
    getComponentData({
      setComponent: setComponent,
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly,
      setCoreCapacities: setCoreCapacities,
      coreCapacities: coreCapacities,
      minYear: minYear,
      maxYear: maxYear,
      setMinYear: setMinYear,
      setMaxYear: setMaxYear,
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
  coreCapacities,
  setCoreCapacities,
  minYear,
  maxYear,
  setMinYear,
  setMaxYear,
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
    start_date: `${minYear}-01-01`, // TODO check these two
    end_date: `${maxYear}-12-31`,
    by_neighbor: false,
    filters: { parent_flow_info_filters: [] },
    summaries: {},
    include_master_summary: false,
    single_source_and_target: true
  };

  // If core capacity filters provided, use those
  if (coreCapacities.length > 0) {
    baseQueryParams.filters.parent_flow_info_filters = [
      ["core_capacities"].concat(coreCapacities)
    ];
  }

  // If GHSA page, then filter by GHSA projects.
  if (id === "ghsa" || ghsaOnly === "true")
    baseQueryParams.filters.parent_flow_info_filters = [
      ["ghsa_funding", "True"]
    ];
  else if (ghsaOnly === "event") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "outbreak_id:not",
      null
    ]);
  } else if (ghsaOnly === "capacity") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "response_or_capacity:not",
      "response"
    ]);
  }

  // Define queries for typical details page.
  const queries = {
    // Information about the entity
    flowBundlesGeneral: FlowBundleGeneralQuery({
      ...baseQueryParams,
      focus_node_type: null
    }),
    flowBundlesFocusSources: FlowBundleFocusQuery({
      ...baseQueryParams,
      focus_node_type: "source"
    }),
    flowBundlesFocusTargets: FlowBundleFocusQuery({
      ...baseQueryParams,
      focus_node_type: "target"
    })
  };

  // Get query results.
  const results = await Util.getQueryResults(queries);
  console.log("results - Analysis.js");
  console.log(results);
  if (props.returnDataOnly === true) return results;
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
      coreCapacities={coreCapacities}
      setCoreCapacities={setCoreCapacities}
      minYear={minYear}
      maxYear={maxYear}
      setMinYear={setMinYear}
      setMaxYear={setMaxYear}
    />
  );
};

export default Analysis;
