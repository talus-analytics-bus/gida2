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
import FlowQuery from "../../misc/FlowQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";
import ScoreQuery from "../../misc/ScoreQuery.js";
import { purples, greens } from "../../map/MapUtil.js";

// Content components
import DetailsSection from "../../views/details/content/DetailsSection.js";
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js";
import Donuts from "../../chart/Donuts/Donuts.js";
import StackBar from "../../chart/StackBar/StackBar.js";
import TableInstance from "../../chart/table/TableInstance.js";
import GhsaToggle from "../../misc/GhsaToggle.js";
import EntityRoleToggle from "../../misc/EntityRoleToggle.js";
import GhsaButton from "../../common/GhsaButton/GhsaButton.js";
import Tab from "../../misc/Tab.js";
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js";

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

  const noResponseData = data.flows.length === 0;
  const [curTab, setCurTab] = React.useState("ihr");
  const [showFlag, setShowFlag] = React.useState(true);

  if (noResponseData && curTab === "event") setCurTab("ihr");

  // Get display name for current flow type
  const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
    .display_name;

  // Track the Top Recipients/Funders table data
  const topTableData = getSummaryAttributeWeightsByNode({
    data: data.flowBundlesFocusOther.flow_bundles,
    field: "core_elements",
    flowTypes: ["disbursed_funds", "committed_funds"],
    nodeType: otherNodeType
  }).filter(
    d =>
      d[otherNodeType] !== undefined &&
      (d[otherNodeType][0].name !== "Not reported" ||
        d[otherNodeType].length > 1)
  );

  // If on GHSA page, get "other" top table to display.
  const topTableDataOther =
    pageType === "ghsa"
      ? getSummaryAttributeWeightsByNode({
          data: data.flowBundlesFocus.flow_bundles,
          field: "core_elements",
          flowTypes: ["disbursed_funds", "committed_funds"],
          nodeType: nodeType
        }).filter(d => d[nodeType].name !== "Not reported")
      : null;

  // True if there are no data to show for the entire page, false otherwise.
  const noData = data.flowBundles.flow_bundles[0] === undefined;
  const noFinancialData = noData
    ? true
    : data.focusSummary.master_summary.flow_types["disbursed_funds"] ===
        undefined &&
      data.focusSummary.master_summary.flow_types["committed_funds"] ===
        undefined;

  // True if the only available data to show are for "unknown" values (specific
  // value no reported).
  const unknownDataOnly = isUnknownDataOnly({
    masterSummary: data.focusSummary.master_summary
  });

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
      ["Other", "Other"],
      ["General IHR", "General IHR Implementation"],
      ["Unspecified", "Unspecified"]
    ].map(c => {
      return {
        func: d => (d[curFlowType] ? d[curFlowType][c[0]] : undefined),
        type: "num",
        title: c[1],
        prop: c[1],
        render: v => Util.formatValue(v, "disbursed_funds")
      };
    })
  );

  // Define header charts
  const pageHeaderContent = {
    header: (
      <h2>
        Total funds {Util.getRoleTerm({ type: "adjective", role: entityRole })}{" "}
        from {Settings.startYear} to {Settings.endYear}
      </h2>
    ),
    content: (
      <FundsByYear
        id={id}
        entityRole={entityRole}
        data={data.focusSummary.master_summary.flow_types}
        unknownDataOnly={unknownDataOnly}
        noFinancialData={noFinancialData}
        flowTypeInfo={flowTypeInfo}
        ghsaOnly={ghsaOnly}
      />
    ),
    toggleFlowType: false,
    hide: noData
  };

  // Define details content sections.
  const showTabs = !noData && !unknownDataOnly && !noFinancialData;

  // For response event funding: get totals.
  const responseEventTotals = (
    <div className={styles.totals}>
      <TotalByFlowType
        inline={true}
        flowType="disbursed_funds"
        data={data.flows}
        label={"event response funding"}
      />
      <TotalByFlowType
        inline={true}
        flowType="committed_funds"
        data={data.flows}
        label={"event response funding"}
      />
    </div>
  );

  const tabSections = showTabs
    ? [
        {
          slug: "ihr",
          header: "IHR funding",
          content: [
            {
              header: <h2>Funding by core element</h2>,
              text: (
                <p>
                  Percentages shown for each core element based on total
                  funding.
                </p>
              ),
              content: (
                <Donuts
                  data={data.focusSummary.master_summary}
                  flowType={curFlowType}
                  ghsaOnly={ghsaOnly}
                  attributeType={"core_elements"}
                  nodeType={nodeType}
                  id={id}
                />
              ),
              toggleFlowType: true,
              hide: noData || unknownDataOnly || noFinancialData
            },
            {
              header: <h2>Funding by core capacity</h2>,
              text: (
                <p>
                  The chart below shows the funds{" "}
                  {Util.getRoleTerm({
                    type: "adjective",
                    role: entityRole
                  })}{" "}
                  by core capacity. Only funded core capacities are shown. Hover
                  over a bar to see additional funding details.
                </p>
              ),
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
                  jeeScores={data.jeeScores[data.nodeData.id]}
                  placeType={data.nodeData.type}
                  id={id}
                  ghsaOnly={ghsaOnly}
                  render={curTab === "ihr"}
                />
              ),
              toggleFlowType: true,
              hide: noData || unknownDataOnly || noFinancialData
            },
            {
              header: <h2>Top {otherEntityRole}s</h2>,
              text: (
                <p>
                  The table below displays {otherEntityRole}s in order of amount
                  of funds{" "}
                  {Util.getRoleTerm({
                    type: "adjective",
                    role: otherEntityRole
                  })}
                  . Click on a{" "}
                  {Util.getRoleTerm({
                    type: "noun",
                    role: otherEntityRole
                  })}{" "}
                  name to view their profile.
                </p>
              ),
              content: (
                <TableInstance
                  sortByProp={"total"}
                  paging={true}
                  tableColumns={[
                    {
                      title: Util.getInitCap(
                        Util.getRoleTerm({
                          type: "noun",
                          role: otherEntityRole
                        })
                      ),
                      prop: otherNodeType,
                      type: "text",
                      func: d => JSON.stringify(d[otherNodeType]),
                      render: d =>
                        getNodeLinkList({
                          urlType: "details",
                          nodeList: JSON.parse(d),
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
                      prop: nodeType,
                      type: "text",
                      func: d => JSON.stringify(d[nodeType]),
                      render: d =>
                        getNodeLinkList({
                          urlType: "details",
                          nodeList: JSON.parse(d),
                          entityRole: entityRole,
                          id: id
                        })
                    }
                  ].concat(topTableCols)}
                  tableData={
                    topTableDataOther
                      ? topTableDataOther.filter(
                          d => d[curFlowType] !== undefined
                        )
                      : []
                  }
                />
              ),
              toggleFlowType: true,
              hide:
                noData ||
                pageType !== "ghsa" ||
                unknownDataOnly ||
                noFinancialData
            }
          ]
        },
        {
          slug: "event",
          header: "Event response funding",
          hide: noResponseData,
          content:
            data.flows.length > 0
              ? [
                  {
                    header: (
                      <div>
                        <h2>
                          Recent event response funding projects <br />
                          {
                            // Time frame
                            // <span>in past 12 months</span>
                          }
                          {
                            // Date range
                            <span className={styles.timeFrame}>
                              {props.responseStart.toLocaleString("en-us", {
                                // month: "short",
                                // day: "numeric",
                                year: "numeric",
                                timeZone: "UTC"
                              })}{" "}
                              -{" "}
                              {props.responseEnd.toLocaleString("en-us", {
                                // month: "short",
                                // day: "numeric",
                                year: "numeric",
                                timeZone: "UTC"
                              })}
                            </span>
                          }
                        </h2>
                      </div>
                    ),
                    text: (
                      <div>
                        <p>
                          This tab shows recent event response funding projects
                          where {data.nodeData.name} or an associated
                          region/group was a {entityRole}. Note that all values
                          listed here may not apply specifically to{" "}
                          {data.nodeData.name}.
                        </p>
                        {responseEventTotals}
                      </div>
                    ),
                    content: (
                      <div>
                        <TableInstance
                          paging={true}
                          sortByProp={"year_range"}
                          tableColumns={[
                            {
                              title: "Event year",
                              prop: "year_range",
                              type: "text",
                              func: d => d.flow_info.outbreak.year_range,
                              render: d => d
                            },
                            {
                              title: "Event response",
                              prop: "event",
                              type: "text",
                              func: d => d.flow_info.outbreak.name,
                              render: d => d
                            },
                            {
                              title: "Project name",
                              prop: "project_name",
                              type: "text",
                              func: d => d.flow_info.project_name,
                              render: d => d
                            },
                            {
                              title: Util.getInitCap(
                                Util.getRoleTerm({
                                  type: "noun",
                                  role: "funder"
                                })
                              ),
                              prop: "source",
                              type: "text",
                              func: d => JSON.stringify(d.source),
                              render: d =>
                                getNodeLinkList({
                                  urlType: "details",
                                  nodeList: JSON.parse(d),
                                  entityRole: "funder",
                                  id: id
                                })
                            },
                            {
                              title: Util.getInitCap(
                                Util.getRoleTerm({
                                  type: "noun",
                                  role: "recipient"
                                })
                              ),
                              prop: "target",
                              type: "text",
                              func: d => JSON.stringify(d.target),
                              render: d =>
                                getNodeLinkList({
                                  urlType: "details",
                                  nodeList: JSON.parse(d),
                                  entityRole: "recipient",
                                  id: id
                                })
                            },
                            {
                              title: "Funding year(s)",
                              prop: "year_range_proj",
                              type: "text",
                              func: d => d.year_range,
                              render: d => Util.formatValue(d, "year_range")
                            },
                            {
                              title:
                                curFlowTypeName + ' (or "In-kind support")',
                              prop: "amount",
                              type: "num",
                              func: d => {
                                // Check whether the monetary amount is available
                                const ft = d.flow_types[curFlowType];
                                const financial = ft !== undefined;
                                if (financial) return ft.focus_node_weight;
                                else {
                                  // If no financial, check for inkind
                                  const inkindField =
                                    curFlowType === "disbursed_funds"
                                      ? "provided_inkind"
                                      : "committed_inkind";
                                  const inkind =
                                    d.flow_types[inkindField] !== undefined;
                                  if (inkind) return -7777;
                                  else return -9999;
                                }
                              },
                              render: d =>
                                d === -7777
                                  ? Util.formatValue(
                                      "In-kind support",
                                      "inkind"
                                    )
                                  : Util.formatValue(d, curFlowType)
                            }
                          ]}
                          tableData={data.flows}
                          hide={r => r.amount === -9999}
                        />
                      </div>
                    ),
                    toggleFlowType: true,
                    hide: noData || unknownDataOnly || noFinancialData
                  }
                ]
              : [
                  {
                    header: <h2>Response funding by outbreak event</h2>,
                    content: (
                      <div>
                        <i>No data to show</i>
                      </div>
                    ),
                    toggleFlowType: false,
                    hide: noData || unknownDataOnly || noFinancialData
                  }
                ]
        }
      ]
    : [];

  const flag = `/flags/${data.nodeData.iso2 || data.nodeData.id}.png`;

  // https://medium.com/@webcore1/react-fallback-for-broken-images-strategy-a8dfa9c1be1e
  const addDefaultSrc = ev => {
    ev.target.src = "/flags/unspecified.png";
    // ev.target.classList.add(styles.unspec);
    setShowFlag(false);
  };

  React.useEffect(() => {
    setShowFlag(true);
    window.scrollTo(0, 0);
  }, [id]);

  const ghsa = pageType === "ghsa";

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.details)}>
      <div className={styles.header}>
        {!ghsa && (
          <div
            style={{
              backgroundColor:
                entityRole === "funder" ? "rgb(56, 68, 52)" : "rgb(68, 0, 66)"
            }}
            className={styles.entityRole}
          >
            <div>{entityRoleNoun} profile</div>
            <EntityRoleToggle
              entityRole={entityRole}
              redirectUrlFunc={v => `/details/${id}/${v}`}
            />
          </div>
        )}
        <div className={styles.countryBanner}>
          <div className={styles.bannerRow}>
            <div className={styles.countryName}>
              {showFlag && (
                <img
                  className={classNames({ [styles.small]: ghsa })}
                  src={flag}
                  onError={e => addDefaultSrc(e)}
                />
              )}
              <h1>{data.nodeData.name}</h1>
            </div>
          </div>
          {pageType !== "ghsa" && (
            <div className={styles.bannerRow}>
              <GhsaToggle
                horizontal={true}
                ghsaOnly={ghsaOnly}
                setGhsaOnly={setGhsaOnly}
              />
              <div className={styles.toggles}>
                {pageType !== "ghsa" && <GhsaButton />}
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        {[pageHeaderContent].map(
          s =>
            !s.hide && (
              <DetailsSection
                header={s.header}
                content={s.content}
                text={s.text}
                curFlowType={curFlowType}
                setCurFlowType={setCurFlowType}
                flowTypeInfo={flowTypeInfo}
                toggleFlowType={s.toggleFlowType}
              />
            )
        )}
      </div>

      {showTabs && (
        <div className={styles.tabs}>
          {tabSections
            .filter(s => s.hide !== true)
            .map(s => (
              <button
                className={classNames(styles.tabToggle, {
                  [styles.selected]: s.slug === curTab
                })}
                onClick={() => setCurTab(s.slug)}
              >
                {s.header}
              </button>
            ))}
        </div>
      )}
      {showTabs && (
        <div className={styles.tabContent}>
          {tabSections
            .filter(s => s.hide !== true)
            .map(s => (
              <Tab
                selected={curTab === s.slug}
                content={s.content.map(
                  s =>
                    !s.hide && (
                      <DetailsSection
                        header={s.header}
                        text={s.text}
                        content={s.content}
                        curFlowType={curFlowType}
                        setCurFlowType={setCurFlowType}
                        flowTypeInfo={flowTypeInfo}
                        toggleFlowType={s.toggleFlowType}
                      />
                    )
                )}
              />
            ))}
        </div>
      )}
      {[].map(
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
          currently available where {data.nodeData.name} is a {entityRoleNoun}.
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
  // Define typical base query parameters used in FlowQuery,
  // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
  // modified in code below.
  const nodeType =
    entityRole === undefined
      ? "target"
      : entityRole === "recipient"
      ? "target"
      : "source";
  const otherNodeType = entityRole === "recipient" ? "source" : "target";
  const baseQueryParams = {
    focus_node_ids: id === "ghsa" ? null : [id],
    focus_node_type: nodeType,
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: false,
    filters: { parent_flow_info_filters: [] },
    summaries: {
      flow_info_summary: ["core_capacities", "core_elements"]
    },
    include_master_summary: true
  };

  // If GHSA page, then filter by GHSA projects, and add "year" filter to the
  // summaries.
  // TODO ADD summaries to FlowBundleGeneralQuery so we don't need this hack.
  if (id === "ghsa" || ghsaOnly === "true") {
    baseQueryParams.summaries.flow_info_summary.push("year");
    baseQueryParams.filters.parent_flow_info_filters.push([
      "ghsa_funding",
      "True"
    ]);
  } else if (ghsaOnly === "event") {
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

  const flowQueryParams = {
    ...JSON.parse(JSON.stringify(baseQueryParams)),
    by_outbreak: true,
    flow_type_ids: [5],
    include_general_amounts: true
  };
  flowQueryParams.filters.parent_flow_info_filters.push([
    "outbreak_id:not",
    null
  ]);

  // if (true) {
  //   flowQueryParams.filters.place_filters = [[nodeType, id]];
  //   flowQueryParams.focus_node_ids = null;
  // }

  // Define queries for typical details page.
  const now = new Date();
  now.setMonth(11);
  now.setDate(31);

  const then = new Date();
  then.setFullYear(now.getFullYear() - 1);
  then.setMonth(0);
  then.setDate(1);
  const queries = {
    // Information about the entity
    nodeData: NodeQuery({ node_id: id }),

    jeeScores: ScoreQuery({
      type: "jee_v1"
    }),

    // Flow bundles by source/target specific pairing, oriented from the other
    // node type (e.g., for a given source node whose page this is, return one
    // row per target node it has a flow with)
    flowBundlesFocusOther: FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: true
    }),
    flows: FlowQuery({
      ...flowQueryParams,
      start_date: Util.formatDatetimeApi(then),
      end_date: Util.formatDatetimeApi(now)
      // filters: { parent_flow_info_filters: [["outbreak_id:not", null]] }
    })
  };

  // If GHSA page, add additional query to show both top funders and top
  // recipients.
  if (id === "ghsa") {
    queries["flowBundlesFocus"] = FlowBundleFocusQuery({
      ...baseQueryParams,
      focus_node_type: entityRole === "recipient" ? "target" : "source",
      focus_node_ids: null
    });
    queries["flowBundles"] = FlowBundleGeneralQuery(baseQueryParams);
    queries["focusSummary"] = FlowBundleFocusQuery({
      ...baseQueryParams,
      focus_node_type: entityRole === "recipient" ? "target" : "source",
      focus_node_ids: null
    });
  } else {
    // Flow bundles (either focus or general depending on the page type)
    queries["flowBundles"] = FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: true
    });
    queries["focusSummary"] = FlowBundleFocusQuery({
      ...baseQueryParams,
      by_neighbor: false,
      summaries: {
        flow_info_summary: ["core_capacities", "core_elements", "year"]
      }
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
      setComponent={setDetailsComponent}
      responseStart={then}
      responseEnd={now}
    />
  );
};

export default Details;
