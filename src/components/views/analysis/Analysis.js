import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./analysis.module.scss";
import GhsaToggle from "../../misc/GhsaToggle.js";
import RadioToggle from "../../misc/RadioToggle.js";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import TimeSlider from "../../misc/TimeSlider.js";
import TableInstance from "../../chart/table/TableInstance.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import Chord from "./content/Chord.js";
import Search from "../../common/Search/Search.js";
import axios from "axios";
import { Link } from "react-router-dom";
import { execute, NodeSums, Chords } from "../../misc/Queries";
import { core_capacities, getNodeLinkList } from "../../misc/Data.js";
import FilterDropdown from "../../common/FilterDropdown/FilterDropdown.js";
import SourceText from "../../common/SourceText/SourceText.js";
import Button from "../../common/Button/Button.js";
import Chevron from "../../common/Chevron/Chevron.js";
import Loading from "../../common/Loading/Loading.js";

// FC for Analysis.
const Analysis = ({
  data,
  ghsaOnly,
  setGhsaOnly,
  flowTypeInfo,
  coreCapacities,
  setCoreCapacities,
  entityRole,
  minYear,
  maxYear,
  setMinYear,
  setMaxYear,
  ...props
}) => {
  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = useState("disbursed");
  const [chordComponent, setChordComponent] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEntityInfo, setSelectedEntityInfo] = useState(null);
  const [entityArcInfo, setEntityArcInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Data
  const [chordData, setChordData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // FUNCTIONS //
  const getChordData = async () => {
    // Define typical base query parameters used in FlowQuery,
    // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
    // modified in code below.
    const nodeType = entityRole === "recipient" ? "target" : "origin";

    const filters = {
      "Flow.year": [["gt_eq", minYear], ["lt_eq", maxYear]],
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
    };

    // add assistance type filter
    if (ghsaOnly === "true") {
      filters["Flow.is_ghsa"] = [true];
    } else if (ghsaOnly === "event") {
      filters["Flow.response_or_capacity"] = ["response"];
    } else if (ghsaOnly === "capacity") {
      filters["Flow.response_or_capacity"] = ["capacity"];
    }

    // add outbreak events filters
    if (props.events && props.events.length > 0) {
      filters["Event.id"] = props.events;
    }
    if (coreCapacities.length > 0) {
      filters["Core_Capacity.name"] = coreCapacities;
    }

    // Define queries for analysis page.
    const queries = {
      chords: Chords({ format: "chord", filters }),
    };

    // Get query results.
    const results = await Util.getQueryResults(queries);
    setChordData(results.chords);
  };
  const getTableData = async () => {
    // Define typical base query parameters used in FlowQuery,
    // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
    // modified in code below.
    const nodeType = entityRole === "recipient" ? "target" : "origin";

    const filters = {
      "Flow.year": [["gt_eq", minYear], ["lt_eq", maxYear]],
      "Flow.flow_type": ["disbursed_funds", "committed_funds"],
    };

    // add assistance type filter
    if (ghsaOnly === "true") {
      filters["Flow.is_ghsa"] = [true];
    } else if (ghsaOnly === "event") {
      filters["Flow.response_or_capacity"] = ["response"];
    } else if (ghsaOnly === "capacity") {
      filters["Flow.response_or_capacity"] = ["capacity"];
    }

    // add outbreak events filters
    if (props.events && props.events.length > 0) {
      filters["Event.id"] = props.events;
    }
    if (coreCapacities.length > 0) {
      filters["Core_Capacity.name"] = coreCapacities;
    }

    // Define queries for analysis page.
    const queries = {
      // chords: Chords({ format: "chord", filters }),
      nodeSumsOrigin: NodeSums({
        format: "table",
        direction: "origin",
        filters,
      }),
      nodeSumsTarget: NodeSums({
        format: "table",
        direction: "target",
        filters,
      }),
    };

    // Get query results.
    const results = await Util.getQueryResults(queries);
    setTableData({ ...results });
  };

  // Get flow type
  const flowType =
    transactionType === "committed" ? "committed_funds" : "disbursed_funds";

  // Get pretty name for flow type
  const flowTypeDisplayName = flowTypeInfo.find(ft => ft.name === flowType)
    .display_name;

  // Get top funder table and top recipient table
  const tableInstances = [];

  const tables = [
    [
      <div className={styles.subtitle}>
        <Chevron type={"funder"} />
        <div>Top funders</div>
      </div>,
      "Funder",
      "origin",
      "nodeSumsOrigin",
    ],
    [
      <div className={styles.subtitle}>
        <Chevron type={"recipient"} />
        <div>Top recipients</div>
      </div>,
      "Recipient",
      "target",
      "nodeSumsTarget",
    ],
  ];

  useEffect(() => {
    if (selectedEntity === null) {
      setShowInfo(false);
      setSelectedEntityInfo(null);
    } else {
      setShowInfo(true);
      setSelectedEntityInfo(
        entityArcInfo.find(d => d.data.id === selectedEntity)
      );
    }
  }, [selectedEntity]);

  // load data initially
  useEffect(() => {
    if (chordData === null) getChordData();
    else if (tableData !== null) setInitialized(true);
  }, [chordData]);
  useEffect(() => {
    if (tableData === null) getTableData();
  }, [tableData]);

  // reload data if params changed
  useEffect(() => {
    if (chordData !== null) getChordData();
  }, [transactionType, ghsaOnly, coreCapacities, minYear, maxYear]);

  const transactionTypeNoun =
    transactionType === "committed" ? "commitments" : "disbursements";
  const info = selectedEntity && showInfo && selectedEntityInfo && (
    <div style={{ display: showInfo }} className={styles.info}>
      <div
        style={{ backgroundColor: selectedEntityInfo.color }}
        className={styles.header}
      >
        <div className={styles.name}>{selectedEntityInfo.name}</div>
        <Button
          callback={() => {
            setSelectedEntity(null);
          }}
          type={"close"}
        />
      </div>
      <div className={styles.contentInfo}>
        <div className={styles.row}>
          <div className={styles.metric}>
            <div className={styles.value}>
              {Util.money(selectedEntityInfo.origin)}
            </div>
            <div className={styles.label}>
              Total {transactionTypeNoun} funded
            </div>
          </div>
          <div className={styles.metric}>
            <div className={styles.value}>
              {Util.money(selectedEntityInfo.target)}
            </div>
            <div className={styles.label}>
              Total {transactionTypeNoun} received
            </div>
          </div>
        </div>

        {true && (
          <div className={styles.row}>
            <Button
              type={"secondary"}
              linkTo={`/details/${selectedEntityInfo.data.id}/funder`}
              label={"View funder profile"}
            />
            <Button
              type={"secondary"}
              linkTo={`/details/${selectedEntityInfo.data.id}/recipient`}
              label={"View recipient profile"}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (tableData !== null)
    tables.forEach(([header, role, roleSlug, dataKey]) => {
      tableInstances.push(
        <div>
          {header}
          <TableInstance
            paging={true}
            tableColumns={[
              {
                title: role,
                prop: roleSlug,
                type: "text",
                func: d => JSON.stringify(d[roleSlug]),
                render: d =>
                  getNodeLinkList({
                    urlType: "details",
                    nodeList: JSON.parse(d),
                    entityRole: role.toLowerCase(),
                    id: undefined,
                    otherId: undefined,
                  }),
              },
              {
                title: "Disbursed",
                prop: "disbursed_funds",
                type: "num",
                className: d => (d > 0 ? "num" : "num-with-text"),
                func: d =>
                  d.disbursed_funds !== undefined ? d.disbursed_funds : "",
                render: d => Util.formatValue(d, "disbursed_funds"),
              },
              {
                title: "Committed",
                prop: "committed_funds",
                type: "num",
                className: d => (d > 0 ? "num" : "num-with-text"),
                func: d =>
                  d.committed_funds !== undefined ? d.committed_funds : "",
                render: d => Util.formatValue(d, "committed_funds"),
              },
            ]}
            tableData={tableData[dataKey]}
            sortByProp={"disbursed_funds"}
            limit={10}
            noNativePaging={true}
            noNativeSearch={true}
            noNativeSorting={true}
          />
        </div>
      );
    });

  const chordContent =
    chordData !== null ? (
      <Chord
        chordData={chordData}
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
    ) : null;

  const chordLegend = (
    <div className={styles.legend}>
      <div className={styles.rect} />
      <div className={styles.labels}>
        <div>Funds more</div>
        <div>Receives more</div>
      </div>
    </div>
  );

  // legend (maybe part of map?)
  return (
    <div className={classNames(styles.analysis, "pageContainer")}>
      <div className={styles.header}>
        <div className={styles.title}>
          International funding by funder/recipient
        </div>
      </div>
      <div className={styles.content}>
        <p>
          The tables below identify the funders that have committed the most
          funds, and the recipients that have received the most funds. Click on
          any entry in the tables for additional detail on that funder or
          recipient's activities. For information on a funder or recipient not
          included on this list, search for that country or organization below.
        </p>
        <Loading
          {...{
            loaded: initialized || tableData !== null,
            margin: "20px 0 0 0",
          }}
        >
          {<div className={styles.tables}>{tableInstances.map(d => d)}</div>}
          {<SourceText />}
        </Loading>
      </div>
      <div className={styles.header}>
        <div className={styles.title}>International funding network</div>
      </div>
      <div className={styles.content}>
        <p>
          The figure below illustrates the flow of funds from funder to
          recipient. Countries and non-country funders are grouped along the
          outside of the circle, and lines through the center of the circle
          correspond to the transfer of funds from funder to recipient. Thicker
          lines represent larger amounts of funding commitments or
          disbursements. Hover over any line to see additional details on the
          funding amount or funders and recipients involved. Totals shown here
          may differ from those shown elsewhere in this site because
          transactions with multiple funders or recipients are not included.
        </p>
        <Loading
          {...{
            loaded: initialized || chordData !== null,
            margin: "20px 0 0 0",
          }}
        >
          {
            <div className={styles.chordDiagram}>
              <div className={styles.chordContainer}>
                {chordContent}
                {chordLegend}
              </div>
              <div className={styles.menuContainer}>
                <div className={styles.menu}>
                  <Search
                    name={"analysis"}
                    callback={setSelectedEntity}
                    expandedDefault={true}
                  />

                  <TimeSlider
                    minYearDefault={Settings.startYear}
                    maxYearDefault={Settings.endYear}
                    onAfterChange={years => {
                      setMinYear(years[0]);
                      setMaxYear(years[1]);
                    }}
                  />
                  <GhsaToggle ghsaOnly={ghsaOnly} setGhsaOnly={setGhsaOnly} />
                  <RadioToggle
                    label={"Choose"}
                    callback={setTransactionType}
                    curVal={transactionType}
                    choices={[
                      {
                        name: "Disbursed",
                        value: "disbursed",
                      },
                      {
                        name: "Committed",
                        value: "committed",
                      },
                    ]}
                  />
                  {
                    // TODO: add this tooltip for CC dropdown
                    // Core capacities were tagged based on names and descriptions of commitments and disbursements. A single commitment or disbursement may support more than one core capacity. Additional information on how core capacities were tagged can be found on the data definitions page.
                  }
                  <FilterDropdown
                    {...{
                      className: [styles.italic],
                      label: "IHR core capacities",
                      openDirection: "down",
                      options: core_capacities,
                      placeholder: "Select core capacities",
                      onChange: v => setCoreCapacities(v.map(d => d.value)),
                      curValues: coreCapacities,
                    }}
                  />
                  {info}
                </div>
                {<SourceText />}
              </div>
            </div>
          }
        </Loading>
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
  coreCapacities,
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
  setLoadingSpinnerOn,
  ...props
}) => {
  if (loading) {
    return <div className={"placeholder"} />;
  } else if (
    component === null ||
    (component &&
      remountComponent({
        component: component,
        props: props,
        ghsaOnly: ghsaOnly,
        coreCapacities: coreCapacities,
        minYear: minYear,
        maxYear: maxYear,
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
      setLoadingSpinnerOn,
      ...props,
    });

    return component ? component : <div className={"placeholder"} />;
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
  setLoadingSpinnerOn,
  ...props
}) => {
  // Define typical base query parameters used in FlowQuery,
  // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
  // modified in code below.
  const nodeType = entityRole === "recipient" ? "target" : "origin";

  const filters = {
    "Flow.year": [["gt_eq", minYear], ["lt_eq", maxYear]],
    "Flow.flow_type": ["disbursed_funds", "committed_funds"],
  };

  // add assistance type filter
  if (ghsaOnly === "true") {
    filters["Flow.is_ghsa"] = [true];
  } else if (ghsaOnly === "event") {
    filters["Flow.response_or_capacity"] = ["response"];
  } else if (ghsaOnly === "capacity") {
    filters["Flow.response_or_capacity"] = ["capacity"];
  }

  // add outbreak events filters
  if (props.events && props.events.length > 0) {
    filters["Event.id"] = props.events;
  }
  if (coreCapacities.length > 0) {
    filters["Core_Capacity.name"] = coreCapacities;
  }

  // Define queries for analysis page.
  const queries = {
    chords: Chords({ format: "chord", filters }),
    nodeSumsOrigin: NodeSums({
      format: "table",
      direction: "origin",
      filters,
    }),
    nodeSumsTarget: NodeSums({
      format: "table",
      direction: "target",
      filters,
    }),
  };

  // Get query results.
  setLoadingSpinnerOn(true);
  const results = await Util.getQueryResults(queries);
  setLoadingSpinnerOn(false);

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
