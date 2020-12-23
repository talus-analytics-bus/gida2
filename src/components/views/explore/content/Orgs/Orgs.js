import React from "react";
import ReactTooltip from "react-tooltip";
import classNames from "classnames";
import styles from "./orgs.module.scss";
import tooltipStyles from "../../../../common/tooltip.module.scss";
import GhsaToggle from "../../../../misc/GhsaToggle.js";
import RadioToggle from "../../../../misc/RadioToggle.js";
import { Settings } from "../../../../../App.js";
import Util from "../../../../misc/Util.js";
import TimeSlider from "../../../../misc/TimeSlider.js";
import TableInstance from "../../../../chart/table/TableInstance.js";
import { core_capacities, getInfoBoxData } from "../../../../misc/Data.js";
import FilterDropdown from "../../../../common/FilterDropdown/FilterDropdown.js";
import FilterSelections from "../../../../common/FilterSelections/FilterSelections.js";
import Chevron from "../../../../common/Chevron/Chevron.js";
import Drawer from "../../../../common/Drawer/Drawer.js";
import {
  getMapTooltipLabel,
  getUnknownValueExplanation,
  getMapColorScale,
  getMapMetricValue,
  greens,
  purples,
} from "../../../../map/MapUtil.js";
import {
  execute,
  NodeSums,
  FlowType,
  Outbreak,
  Stakeholder,
} from "../../../../misc/Queries";
import { getNodeData, getTableRowData } from "../../../../misc/Data.js";
import { getNodeLinkList } from "../../../../misc/Data.js";
import SourceText from "../../../../common/SourceText/SourceText.js";
import InfoBox from "../../../../map/InfoBox.js";
import { appContext } from "../../../../misc/ContextProvider";

// FC for Orgs.
const Orgs = ({
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
  events,
  setEvents,
  ...props
}) => {
  // Track transaction type selected for the map
  const [transactionType, setTransactionType] = React.useState("disbursed");

  // Track support type selected for the map
  const [supportType, setSupportType] = React.useState("funds");

  // Track main map title
  const [mapTitle, setMapTitle] = React.useState("funds");

  const [tooltipData, setTooltipData] = React.useState(undefined);
  const [revealed, setRevealed] = React.useState(false);
  const [tooltipNodeData, setTooltipNodeData] = React.useState(undefined);
  const [hoveredEntity, setHoveredEntity] = React.useState(undefined);

  // Define filter content
  const outbreakOptions = data.outbreaks.map(d => {
    return { value: d.id, label: d.name };
  });
  const filterSelections = ghsaOnly !== "event" ? coreCapacities : events;

  const filterSelectionBadges = filterSelections.length > 0 && (
    <div>
      <div className={classNames(styles.sectionTitle, styles.filterBadges)}>
        Filters selected:
      </div>
      <div>
        {ghsaOnly !== "event" && (
          <FilterSelections
            {...{
              optionList: core_capacities,
              selections: coreCapacities,
              setSelections: setCoreCapacities,
              type: "coreCapacities",
            }}
          />
        )}
        {ghsaOnly === "event" && (
          <FilterSelections
            {...{
              optionList: outbreakOptions,
              selections: events,
              setSelections: setEvents,
              type: "events",
            }}
          />
        )}
      </div>
    </div>
  );

  const filters = (
    <div className={styles.filterContainer}>
      {ghsaOnly === "event" && (
        <FilterDropdown
          {...{
            label: "Select event responses",
            options: outbreakOptions,
            placeholder: "Select event response",
            onChange: v => setEvents(v.map(d => d.value)),
            curValues: events,
            className: [styles.italic],
            isDark: false,
            openDirection: "down",
            setValues: setEvents,
          }}
        />
      )}
      {ghsaOnly !== "event" && (
        <FilterDropdown
          {...{
            label: "Select IHR core capacities",
            options: core_capacities,
            placeholder: "Select core capacities",
            onChange: v => setCoreCapacities(v.map(d => d.value)),
            curValues: coreCapacities,
            className: [styles.italic],
            isDark: false,
            openDirection: "down",
            setValues: setCoreCapacities,
          }}
        />
      )}
      {filterSelectionBadges}
    </div>
  );

  const yearRange =
    minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`;

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
    supportType: supportType,
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

  // Get data for tables and tooltips.
  // Define "columns" for map data.
  const getTableColDefs = (nodeTypeForColDef, entityRoleForColDef) => {
    return [
      {
        title: "Organization",
        prop: nodeTypeForColDef,
        type: "text",
        func: d => JSON.stringify(d[nodeTypeForColDef]),
        render: d =>
          getNodeLinkList({
            urlType: "details",
            nodeList: JSON.parse(d),
            entityRole: entityRoleForColDef,
            id: undefined,
            otherId: undefined,
          }),
      },
      {
        title: "Map metric raw value",
        prop: "value_raw",
        type: "num",
        func: d =>
          getMapMetricValue({
            d,
            supportType,
            flowType,
            coreCapacities,
            forTooltip: false,
          }),
      },
      {
        title: "Map metric display value",
        prop: "value",
        type: "num",
        render: d => Util.formatValue(d, supportType),
        func: d =>
          getMapMetricValue({
            d,
            supportType,
            flowType,
            coreCapacities,
            forTooltip: true,
          }),
      },
      {
        title: "Unknown value explanation (if applicable)",
        prop: "unknown_explanation",
        type: "text",
        render: d => Util.formatValue(d, "text"),
        func: d =>
          getUnknownValueExplanation({
            datum: d,
            value: getMapMetricValue({
              d,
              supportType,
              flowType,
              coreCapacities,
            }),
            entityRole: entityRoleForColDef,
          }),
      },
      {
        title: "Stakeholder ID",
        prop: "shID",
        type: "text",
        render: d => d,
      },
      {
        title: "Stakeholder name",
        prop: "stakeholderName",
        type: "text",
        render: d => d,
      },
      {
        title: "Map tooltip label",
        prop: "tooltip_label",
        type: "text",
        render: d =>
          getMapTooltipLabel({
            val: d,
            supportType,
            flowType,
            minYear,
            maxYear,
            entityRoleForColDef,
          }),
        func: d =>
          getMapMetricValue({
            d,
            supportType,
            flowType,
            coreCapacities,
          }),
      },
    ];
  };

  // // get table data
  // const tableData = [];
  // for (const [k, v] of Object.entries(data.nodeSumsOrigin)) {
  //   tableData.push;
  // }

  // Get top funder table and top recipient table
  const tableInstances = [];

  const tables = [
    [
      <div className={styles.subtitle}>
        <div className={"flexrow"}>
          <Chevron type={"funder"} />
          <div>Top organizational funders ({yearRange})</div>
        </div>
        <div class={"normal"}>
          <i>Countries and government agencies not shown</i>
        </div>
      </div>,
      "Funder",
      "origin",
      "nodeSumsOrigin",
    ],
    [
      <div className={styles.subtitle}>
        <div className={"flexrow"}>
          <Chevron type={"recipient"} />
          <div>Top organizational recipients ({yearRange})</div>
        </div>
        <div class={"normal"}>
          <i>Countries and government agencies not shown</i>
        </div>
      </div>,
      "Recipient",
      "target",
      "nodeSumsTarget",
    ],
  ];
  // getNodeLinkList({
  //   urlType: "details",
  //   nodeList: JSON.parse(d),
  //   entityRole: table[1].toLowerCase(),
  //   id: undefined,
  //   otherId: undefined,
  // }),
  tables.forEach(([subtitleJsx, role, roleSlug, dataKey]) => {
    const orgTableData = [];
    for (const [k, v] of Object.entries(data[dataKey])) {
      if (v[flowType] !== undefined) {
        const stakeholderInfo = data.stakeholders[k];
        orgTableData.push({
          [roleSlug]: getNodeLinkList({
            urlType: "details",
            nodeList: [stakeholderInfo],
            entityRole: role.toLowerCase(),
            id: undefined,
            otherId: undefined,
          }),
          value_raw: v[flowType],
          value: v[flowType],
          shID: k,
          stakeholderName: stakeholderInfo.name,
        });
      }
    }

    const tableRowDefs = getTableColDefs(roleSlug, role.toLowerCase()); // target, recipient

    const updateTooltipData = ({ d, nodeType, dataKey, mapData }) => {
      const datum = data[dataKey][d.id];

      // Get tooltip data on hover
      const tooltipData =
        tooltipNodeData !== undefined
          ? getInfoBoxData({
              nodeDataToCheck: d,
              mapData,
              datum: datum,
              supportType,
              jeeScores: [],
              coreCapacities: [],
              colorScale: () => {
                if (nodeType === "origin") return greens[greens.length - 1];
                else return purples[purples.length - 1];
              },
              entityRole: nodeType === "origin" ? "funder" : "recipient",
              minYear,
              maxYear,
              flowType,
              simple: false,
            })
          : undefined;
      if (tooltipData && tooltipData.colorValue === undefined)
        tooltipData.colorValue = 1;
      setHoveredEntity(d.id);
      setTooltipNodeData(d);
      setTooltipData(tooltipData);
    };
    tableInstances.push(
      <div>
        <h2>{subtitleJsx}</h2>
        <TableInstance
          key={roleSlug}
          tooltipFunc={function(d) {
            return {
              "data-tip": "",
              "data-for": "orgTooltip",
              onMouseOver: () =>
                updateTooltipData({
                  d: data.stakeholders[d.shID][0],
                  nodeType: roleSlug,
                  dataKey,
                  mapData: [d],
                }),
            };
          }}
          paging={true}
          noNativeSorting={true}
          tableColumns={[
            {
              title: role,
              prop: roleSlug,
              type: "text",
              func: d => d[roleSlug],
              render: d => d,
            },
            {
              title: flowTypeDisplayName,
              prop: "value",
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              func: d => d.value_raw,
              render: d => Util.formatValue(d, flowType),
            },
            {
              title: "Stakeholder slug (for data binding)",
              prop: "shID",
              type: "text",
              hide: true,
            },
            {
              title: "Stakeholder name (for searching)",
              prop: "stakeholderName",
              type: "text",
              hide: true,
            },
          ]}
          tableData={orgTableData}
          sortByProp={"value"}
        />
      </div>
    );
  });

  ReactTooltip.rebuild();

  return (
    <div className={styles.orgs}>
      <Drawer
        {...{
          openDefault: false,
          label: "Options",
          contentSections: [
            <div className={styles.menu}>
              <div className={styles.menuContent}>
                <GhsaToggle
                  label={"Select data"}
                  ghsaOnly={ghsaOnly}
                  setGhsaOnly={setGhsaOnly}
                />
                <RadioToggle
                  label={"Select support type"}
                  callback={setSupportType}
                  curVal={supportType}
                  choices={[
                    {
                      name: "Financial support",
                      value: "funds",
                    },
                    {
                      name: "In-kind support",
                      value: "inkind",
                      tooltip:
                        "In-kind support is the contribution of goods or services to a recipient. Examples of in-kind support include providing technical expertise or programming support, or supporting GHSA action packages.",
                    },
                  ]}
                />
                {metricHasTransactionType && (
                  <RadioToggle
                    label={"Select funding type"}
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
                )}
                {filters}
                <TimeSlider
                  side={"left"}
                  hide={supportType === "jee"}
                  minYearDefault={Settings.startYear}
                  maxYearDefault={Settings.endYear}
                  onAfterChange={years => {
                    setMinYear(years[0]);
                    setMaxYear(years[1]);
                  }}
                />
              </div>
            </div>,
          ],
        }}
      />
      <div className={styles.content}>
        <div className={styles.tables}>{tableInstances.map(d => d)}</div>
        {<SourceText />}
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"orgTooltip"}
          type="light"
          className={classNames(tooltipStyles.tooltip, tooltipStyles.simple)}
          place="top"
          delayShow={500}
          offset={{ top: 5 }}
          effect="float"
          clickable={true}
          afterShow={function(e) {
            setRevealed(true);
          }}
          afterHide={function(e) {
            setRevealed(false);
          }}
          eventOff={null}
          getContent={() =>
            tooltipData && (
              <InfoBox
                {...{
                  simple: false,
                  entityRole,
                  supportType,
                  nodeData: tooltipNodeData,
                  infoBoxData: tooltipData,
                  setNodeData: setTooltipNodeData,
                  revealed,
                }}
              />
            )
          }
        />
      }
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
  ghsaOnly,
  events,
}) => {
  const remount =
    component.props.minYear !== minYear ||
    component.props.maxYear !== maxYear ||
    component.props.entityRole !== entityRole ||
    component.props.ghsaOnly !== ghsaOnly ||
    component.props.coreCapacities.toString() !==
      props.coreCapacities.toString() ||
    component.props.events.toString() !== events.toString();
  return remount;
};

export const renderOrgs = ({
  component,
  setComponent,
  loading,
  id,
  entityRole,
  setEntityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  setLoadingSpinnerOn,
  events,
  setEvents,
  ...props
}) => {
  // Set IDs
  id = parseInt(id);

  if (loading) {
    return <div className={"placeholder"} />;
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
        maxYear: props.maxYear,
        events,
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
      setLoadingSpinnerOn,
      setEvents,
      events,
      ...props,
    });

    return component ? component : <div className={"placeholder"} />;
  } else {
    setLoadingSpinnerOn(false);
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
  setLoadingSpinnerOn,
  setEvents,
  ...props
}) => {
  // Define typical base query parameters used in FlowQuery,
  // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
  // modified in code below.
  const baseQueryParams = {
    focus_node_ids: null,
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${props.minYear}-01-01`, // TODO check these two
    end_date: `${props.maxYear}-12-31`,
    by_neighbor: false,
    filters: { parent_flow_info_filters: [] },
    summaries: {},
    include_master_summary: false,
    node_category: ["organization"],
    // by_node_categories: ["country", "organization"]
  };

  // If core capacity filters provided, use those
  if (props.coreCapacities.length > 0) {
    baseQueryParams.filters.parent_flow_info_filters.push(
      ["core_capacities"].concat(props.coreCapacities)
    );
  }

  // // If outbreak response filters provided, use those
  // // TODO
  // if (props.events && props.events.length > 0) {
  //   baseQueryParams.filters.parent_flow_info_filters.push(
  //     ["outbreak_id"].concat(props.events)
  //   );
  // }

  // If GHSA page, then filter by GHSA projects.
  if (ghsaOnly === "true")
    baseQueryParams.filters.parent_flow_info_filters.push([
      "ghsa_funding",
      "True",
    ]);
  else if (ghsaOnly === "event") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "outbreak_id:not",
      null,
    ]);
  } else if (ghsaOnly === "capacity") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "response_or_capacity:not",
      "response",
    ]);
  }

  // Define queries for typical details page.
  const allowedCats = [
    // "world",
    // "government",
    "international_organization_",
    "private_sector",
    "foundation",
    "international_organization",
    // "country",
    "ngo",
    "ngo_",
    "other",
    "academia",
  ];
  const allowedSubcats = [
    // "government",
    "organization",
    // "region",
    // "state_/_department_/_territory",
    // "agency",
    "other",
    "sub-organization",
  ];
  const nodeSumsFilters = {
    "Stakeholder.cat": allowedCats,
    "Stakeholder.subcat": allowedSubcats,
    "Stakeholder.slug": [["neq", "not-reported"]],
    "Flow.year": [["gt_eq", props.minYear], ["lt_eq", props.maxYear]],
  };

  // add assistance type filter
  if (ghsaOnly === "true") {
    nodeSumsFilters["Flow.is_ghsa"] = [true];
  } else if (ghsaOnly === "event") {
    nodeSumsFilters["Flow.response_or_capacity"] = ["response"];
  } else if (ghsaOnly === "capacity") {
    nodeSumsFilters["Flow.response_or_capacity"] = ["capacity"];
  }

  // add outbreak events filters
  if (props.events && props.events.length > 0) {
    nodeSumsFilters["Event.id"] = props.events;
  }
  if (props.coreCapacities.length > 0) {
    nodeSumsFilters["Core_Capacity.name"] = props.coreCapacities;
  }

  // // CONTEXT
  // const context = useContext(appContext) || defaultContext;

  const queries = {
    nodeSumsOrigin: NodeSums({
      direction: "origin",
      filters: nodeSumsFilters,
    }),
    nodeSumsTarget: NodeSums({
      direction: "target",
      filters: nodeSumsFilters,
    }),
    flowTypeInfo: FlowType({}),
    outbreaks: Outbreak({}),
    stakeholders: Stakeholder({ by: "id" }),

    // // Information about the entity
    // flowBundlesFocusSources: FlowBundleFocusQuery({
    //   ...baseQueryParams,
    //   focus_node_type: "origin",
    // }),
    // flowBundlesFocusTargets: FlowBundleFocusQuery({
    //   ...baseQueryParams,
    //   focus_node_type: "target",
    // }),
    // outbreaks: OutbreakQuery({}),
  };

  // Get query results.
  setLoadingSpinnerOn(true);
  const results = await execute({ queries });
  setLoadingSpinnerOn(false);

  // Feed results and other data to the details component and mount it.
  setComponent(
    <Orgs
      id={id}
      entityRole={entityRole}
      setEntityRole={setEntityRole}
      data={results}
      flowTypeInfo={results.flowTypeInfo}
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
      events={props.events}
      setEvents={setEvents}
    />
  );
};

export default Orgs;
