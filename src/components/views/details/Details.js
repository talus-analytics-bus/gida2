import React from "react";
import { Link } from "react-router-dom";
import styles from "./details.module.scss";
import classNames from "classnames";
import { Settings } from "../../../App.js";
import {
  getNodeLinkList,
  getWeightsBySummaryAttributeSimple,
  getSummaryAttributeWeightsByNode,
  isUnknownDataOnly,
  parseIdsAsNames,
} from "../../misc/Data.js";
import Util from "../../misc/Util.js";

// queries
import {
  execute,
  Stakeholder,
  Assessment,
  Flow,
  NodeSums,
  Outbreak,
} from "../../misc/Queries";

import { purples, greens, pvsCats, pvsColors } from "../../map/MapUtil.js";

// Content components
import DetailsSection from "../../views/details/content/DetailsSection.js";
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js";
import Donuts from "../../chart/Donuts/Donuts.js";
import StackBar from "../../chart/StackBar/StackBar.js";
import TableInstance from "../../chart/table/TableInstance.js";
import EntityRoleToggle from "../../misc/EntityRoleToggle.js";
import ScoreBlocks from "../../common/ScoreBlocks/ScoreBlocks.js";
import Tab from "../../misc/Tab.js";
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../common/tooltip.module.scss";
import TopTable from "../../chart/TopTable/TopTable";

// FC for Details.
const Details = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  setComponent,
  setLoadingSpinnerOn,
  ...props
}) => {
  const direction = entityRole === "funder" ? "origin" : "target";
  const otherDirection = direction === "origin" ? "target" : "origin";

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
  const nodeType = entityRole === "funder" ? "origin" : "target";
  const otherNodeType = entityRole === "funder" ? "target" : "origin";

  // Track whether viewing committed or disbursed/provided assistance
  const [curFlowType, setCurFlowType] = React.useState("disbursed_funds");
  const [pvsTooltipData, setPvsTooltipData] = React.useState(undefined);

  // TODO handle response data
  const noResponseData = data.flows.paging.n_records === 0;
  const [curTab, setCurTab] = React.useState("ihr");
  const [showFlag, setShowFlag] = React.useState(
    data.nodeData.cat === "country"
  );

  const [curPvsEdition, setCurPvsEdition] = React.useState(
    data.pvs.eds[0] || {}
  );

  if (noResponseData && curTab === "event") setCurTab("ihr");

  // Get display name for current flow type
  const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
    .display_name;

  // True if there are no data to show for the entire page, false otherwise.
  // TODO make work with new API
  const noData = false;
  const noFinancialData = noData ? true : false;

  // stop loading spinner if no data
  if (noData || noFinancialData)
    setLoadingSpinnerOn(false, false, undefined, true);

  // True if the only available data to show are for "unknown" values (specific
  // value no reported).
  // TODO make work with new API
  const unknownDataOnly = false;

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
        unknownDataOnly={unknownDataOnly}
        noFinancialData={noFinancialData}
        flowTypeInfo={flowTypeInfo}
        ghsaOnly={ghsaOnly}
        setLoadingSpinnerOn={setLoadingSpinnerOn}
      />
    ),
    toggleFlowType: false,
    hide: noData,
  };

  // Define details content sections.
  const showTabs = !noData && !unknownDataOnly && !noFinancialData;

  // For event response funding: get totals.
  const eventResponseTotals = (
    <div className={styles.totals}>
      <TotalByFlowType
        inline={true}
        flowType="disbursed_funds"
        data={data.flows.data}
        label={"event response funding"}
      />
      <TotalByFlowType
        inline={true}
        flowType="committed_funds"
        data={data.flows.data}
        label={"event response funding"}
      />
    </div>
  );

  const pvsLegend = (
    <div className={styles.legend}>
      <b>Fundamental components</b>
      <div>
        {pvsCats.map((d, i) => (
          <div>
            <div
              style={{ backgroundColor: pvsCats[i][1] }}
              className={styles.circle}
            >
              {Util.roman(i + 1)}
            </div>
            <div>{pvsCats[i][0]}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const updatePvsTooltipData = d => {
    const allEdVals = data.pvs.scores.filter(
      dd => dd.ind.toLowerCase() === d.indName.toLowerCase()
    );

    const indNum = d.indId.split(" ")[0].split("-")[1];
    const tooltipData = {
      title: (
        <div>
          <div
            style={{ backgroundColor: pvsCats[d.cat - 1][1] }}
            className={styles.circle}
          >
            {Util.roman(d.cat)}
          </div>
          <div>{d.indId + " " + d.indName}</div>
        </div>
      ),
      cols: ["Edition number", "Score"],
      rows: allEdVals.map((dd, ii) => {
        return [dd.ed, dd.score];
      }),
    };
    setPvsTooltipData(tooltipData);
  };
  // tooltipFunc={d => {
  //   return {
  //     "data-tip": "",
  //     "data-for": "pvsTooltip",
  //     onMouseOver: () => updatePvsTooltipData(d)
  //   };
  // }}
  const pvsTabContent = [
    {
      header: (
        <div className={styles.header}>
          <div>
            <h2>
              PVS Evaluation scores <br />
            </h2>
            <div className={styles.select}>
              <b>OIE PVS score edition</b>
              <form>
                <select
                  onChange={v =>
                    setCurPvsEdition(
                      data.pvs.eds.find(d => d.ed === v.target.value)
                    )
                  }
                >
                  {[...new Set(data.pvs.eds.map(d => d.ed))].map(d => (
                    <option value={d}>{d}</option>
                  ))}
                </select>
              </form>
            </div>
            <p className={styles.subText}>
              Evaluation conducted in {curPvsEdition.date}
            </p>
          </div>
          {pvsLegend}
        </div>
      ),
      text: undefined,
      content: (
        <div>
          <TableInstance
            pageLength={20}
            paging={true}
            sortByProp={"cat"}
            tableColumns={[
              {
                title: "Fundamental component",
                prop: "cat",
                type: "text",
                func: d => d.cat,
                width: 120,
                render: d => (
                  <div
                    style={{ backgroundColor: pvsCats[d - 1][1] }}
                    className={styles.circle}
                  >
                    {Util.roman(d)}
                  </div>
                ),
              },
              {
                title: "Indicator ID",
                prop: "indId",
                type: "text",
                func: d => d.indId,
                render: d => d,
                hide: true,
              },
              {
                title: "Indicator name (only)",
                prop: "indName",
                type: "text",
                func: d => d.ind,
                render: d => d,
                hide: true,
              },
              {
                title: "Core competency",
                prop: "ind",
                type: "text",
                func: d => d.indId + " " + d.ind,
                render: d => d,
              },
              {
                title: "Level of advancement (1 to 5)",
                prop: "score",
                type: "text",
                func: d => (d.score === "N/A" ? -9999 : d.score),
                width: 240,
                render: d => (
                  <ScoreBlocks
                    {...{
                      value: d,
                      rangeArray: [1, 2, 3, 4, 5],
                      colors: pvsColors,
                    }}
                  />
                ),
              },
            ]}
            tableData={data.pvs.scores.filter(d => d.ed === curPvsEdition.ed)}
            sortOrder={"ascending"}
            hide={r => r.amount === -9999}
          />
        </div>
      ),
      toggleFlowType: false,
      hide: noData || unknownDataOnly || noFinancialData,
    },
  ];

  const tabSections = showTabs
    ? [
        {
          slug: "ihr",
          header: "IHR funding",
          content: [
            // {
            //   header: <h2>Funding by core element</h2>,
            //   text: (
            //     <p>
            //       Percentages shown for each core element based on total
            //       funding.
            //     </p>
            //   ),
            //   content: (
            //     <Donuts
            //       data={data.focusSummary.master_summary}
            //       flowType={curFlowType}
            //       ghsaOnly={ghsaOnly}
            //       attributeType={"core_elements"}
            //       nodeType={nodeType}
            //       id={id}
            //     />
            //   ),
            //   toggleFlowType: true,
            //   hide: noData || unknownDataOnly || noFinancialData
            // },
            {
              header: <h2>Funding by core capacity</h2>,
              text: (
                <p>
                  The chart below shows the funds{" "}
                  {Util.getRoleTerm({
                    type: "adjective",
                    role: entityRole,
                  })}{" "}
                  by core capacity. Only funded core capacities are shown. Hover
                  over a bar to see additional funding details.
                </p>
              ),
              // TODO fix StackBar
              content: (
                <StackBar
                  data={data.stackBar.points}
                  staticStakeholders={props.nodesData}
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
              hide: noData || unknownDataOnly || noFinancialData,
            },
            {
              header: <h2>Top {otherEntityRole}s</h2>,
              text: (
                <p>
                  The table below displays {otherEntityRole}s in order of amount
                  of funds{" "}
                  {Util.getRoleTerm({
                    type: "adjective",
                    role: otherEntityRole,
                  })}
                  . Click on a{" "}
                  {Util.getRoleTerm({
                    type: "noun",
                    role: otherEntityRole,
                  })}{" "}
                  name to view their profile.
                </p>
              ),
              content: (
                <TopTable
                  {...{
                    id,
                    curFlowType,
                    otherEntityRole,
                    otherNodeType: direction,
                    direction,
                    staticStakeholders: data.nodesData,
                  }}
                />
              ),
              toggleFlowType: true,
              hide: noData || unknownDataOnly || noFinancialData,
            },
            {
              header: <h2>Top {entityRole}s</h2>,
              content: pageType === "ghsa" && (
                <TopTable
                  {...{
                    id,
                    curFlowType,
                    otherEntityRole: entityRole,
                    otherNodeType: otherDirection,
                    direction: otherDirection,
                    staticStakeholders: data.nodesData,
                  }}
                />
              ),
              toggleFlowType: true,
              hide:
                noData ||
                pageType !== "ghsa" ||
                unknownDataOnly ||
                noFinancialData,
            },
          ],
        },
        {
          slug: "event",
          header: "Event response funding",
          hide: noResponseData,
          content:
            !noResponseData > 0
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
                            // // Date range
                            // <span className={styles.timeFrame}>
                            //   {props.responseStart.toLocaleString("en-us", {
                            //     // month: "short",
                            //     // day: "numeric",
                            //     year: "numeric",
                            //     timeZone: "UTC",
                            //   })}{" "}
                            //   -{" "}
                            //   {props.responseEnd.toLocaleString("en-us", {
                            //     // month: "short",
                            //     // day: "numeric",
                            //     year: "numeric",
                            //     timeZone: "UTC",
                            //   })}
                            // </span>
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
                        {eventResponseTotals}
                      </div>
                    ),
                    content: (
                      <div>
                        <TableInstance
                          paging={true}
                          sortByProp={"years"}
                          tableColumns={[
                            {
                              title: "Event response",
                              prop: "event",
                              type: "text",
                              func: d => {
                                return data.outbreaks
                                  .filter(dd => d.events.includes(dd.id))
                                  .map(dd => dd.name)
                                  .join("· ");
                              },
                              render: d => d,
                            },
                            {
                              title: "Project name",
                              prop: "project_name",
                              type: "text",
                              func: d => d.name,
                              render: d => d,
                            },
                            {
                              title: Util.getInitCap(
                                Util.getRoleTerm({
                                  type: "noun",
                                  role: "funder",
                                })
                              ),
                              prop: "origins",
                              type: "text",
                              func: d =>
                                parseIdsAsNames({
                                  d,
                                  stakeholders: data.nodesData,
                                  field: "origins",
                                }),
                              render: d =>
                                getNodeLinkList({
                                  urlType: "details",
                                  nodeList: JSON.parse(d),
                                  entityRole,
                                  id: id,
                                }),
                            },
                            {
                              title: Util.getInitCap(
                                Util.getRoleTerm({
                                  type: "noun",
                                  role: "recipient",
                                })
                              ),
                              prop: "targets",
                              type: "text",
                              func: d =>
                                parseIdsAsNames({
                                  d,
                                  stakeholders: data.nodesData,
                                  field: "targets",
                                }),
                              render: d =>
                                getNodeLinkList({
                                  urlType: "details",
                                  nodeList: JSON.parse(d),
                                  entityRole: otherEntityRole,
                                  id: id,
                                }),
                            },
                            {
                              title: "Funding year(s)",
                              prop: "year_range_proj",
                              type: "text",
                              func: d => d.years,
                              render: d => d,
                            },
                            {
                              title:
                                curFlowTypeName + ' (or "In-kind support")',
                              prop: "amount",
                              type: "num",
                              className: d => (d > 0 ? "num" : "num-with-text"),
                              func: d => {
                                // Check whether the monetary amount is available
                                const ft = d[curFlowType];
                                const financial = !d.is_inkind;
                                if (financial) return ft;
                                else {
                                  // If no financial, check for inkind
                                  const inkindField =
                                    curFlowType === "disbursed_funds"
                                      ? "provided_inkind"
                                      : "committed_inkind";
                                  const inkind = d[inkindField] !== null;
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
                                  : Util.formatValue(d, curFlowType),
                            },
                          ]}
                          tableData={data.flows.data}
                          hide={r => r.amount === -9999}
                        />
                      </div>
                    ),
                    toggleFlowType: true,
                    hide: noData || unknownDataOnly || noFinancialData,
                  },
                ]
              : [
                  {
                    header: <h2>Event response funding</h2>,
                    content: (
                      <div>
                        <i>No data to show</i>
                      </div>
                    ),
                    toggleFlowType: false,
                    hide: noData || unknownDataOnly || noFinancialData,
                  },
                ],
        },
        {
          slug: "pvs",
          header: "PVS scores",
          content: pvsTabContent,
          hide: data.pvs.scores.length === 0 || entityRole === "funder",
        },
      ]
    : [];

  const flagId = data.nodeData.slug ? data.nodeData.slug : "unspecified";

  const ghsa = pageType === "ghsa";

  const flagSrc = ghsa
    ? `/flags/ghsa.png`
    : `https://flags.talusanalytics.com/1000px/${flagId}.png`;
  // : `https://www.countryflags.io/${flagId}/flat/64.png`;
  const flag =
    data.nodeData.cat === "country" || ghsa ? (
      <img
        onError={e => addDefaultSrc(e)}
        className={classNames({ [styles.small]: ghsa })}
        src={flagSrc}
      />
    ) : null;
  // const flag = `/flags/${data.nodeData.iso2 || data.nodeData.id}.png`;

  // https://medium.com/@webcore1/react-fallback-for-broken-images-strategy-a8dfa9c1be1e
  const addDefaultSrc = ev => {
    ev.target.src = "/flags/unspecified.png";
    // ev.target.classList.add(styles.unspec);
    setShowFlag(false);
  };

  React.useEffect(() => {
    setShowFlag(true);
    setCurPvsEdition(data.pvs.eds[0] || {});
    window.scrollTo(0, 0);
  }, [id]);
  React.useEffect(() => {
    ReactTooltip.rebuild();
  }, [curPvsEdition]);
  React.useEffect(() => {
    setCurTab("ihr");
  }, [entityRole]);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.details)}>
      <div className={styles.header}>
        {!ghsa && (
          <div
            style={{
              backgroundColor:
                entityRole === "funder" ? "rgb(56, 68, 52)" : "rgb(68, 0, 66)",
            }}
            className={styles.entityRole}
          >
            <div>{entityRoleNoun} profile</div>
          </div>
        )}
        <div className={styles.countryBanner}>
          <div className={styles.bannerRow}>
            <div className={styles.countryName}>
              {showFlag && flag && flag}
              <h1>{data.nodeData.name}</h1>
            </div>
            {!ghsa && (
              <EntityRoleToggle
                entityRole={entityRole}
                redirectUrlFunc={v => `/details/${id}/${v}`}
              />
            )}
          </div>
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
                  [styles.selected]: s.slug === curTab,
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
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"pvsTooltip"}
          type="light"
          className={classNames(
            tooltipStyles.tooltip,
            tooltipStyles.simple,
            tooltipStyles.fullTable
          )}
          place="top"
          effect="float"
          getContent={() =>
            pvsTooltipData && (
              <div>
                <div className={tooltipStyles.header}>
                  {pvsTooltipData.title}
                </div>
                <div className={tooltipStyles.content}>
                  <table>
                    <thead>
                      <tr>
                        {pvsTooltipData.cols.map(d => (
                          <th>{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pvsTooltipData.rows.map(d => (
                        <tr>
                          {d.map(dd => (
                            <td>{dd}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
        />
      }
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
  setLoadingSpinnerOn,
  setGhsaOnly,
}) => {
  if (loading) {
    return <div className={"placeholder"} />;
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
      setGhsaOnly: setGhsaOnly,
      setLoadingSpinnerOn,
    });

    return detailsComponent ? (
      detailsComponent
    ) : (
      <div className={"placeholder"} />
    );
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
  setGhsaOnly,
  setLoadingSpinnerOn,
}) => {
  // define directions for queries
  const direction = entityRole === "funder" ? "origin" : "target";
  const otherDirection = direction === "origin" ? "target" : "origin";

  // define common filters for most queries
  const commonFilters = {};

  // if GHSA page, filter by `is_ghsa === true`
  const isGhsaPage = id === "ghsa";
  if (isGhsaPage) {
    commonFilters["Flow.is_ghsa"] = [true];
  }

  const queries = {
    // Information about the entity
    nodesData: Stakeholder({ by: "id" }),
    outbreaks: Outbreak({}),

    jeeScores: Assessment({
      scoreType: "JEE v1",
    }),

    pvs: Assessment({
      id,
      scoreType: "PVS",
    }),
  };

  // core capacity bar chart filters
  const stackBarFilters = {
    "Core_Capacity.name": [["neq", "Unspecified"]],
    "Flow.flow_type": ["disbursed_funds", "committed_funds"],
    "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
  };

  // If GHSA page, add additional query to show both top funders and top
  // recipients.
  if (isGhsaPage) {
    // get flows for GHSA
    queries.flows = Flow({
      filters: {
        "Project_Constants.response_or_capacity": ["response"],
        "Project_Constants.is_ghsa": [true],
      },
    });
  } else {
    stackBarFilters["OtherStakeholder.id"] = [id];

    // get flows for defined target/origin
    queries.flows = Flow({
      filters: { "Project_Constants.response_or_capacity": ["response"] },
      [direction + "Ids"]: [id],
      [otherDirection + "Ids"]: [],
    });
  }
  // TODO move to StackBar component
  queries.stackBar = NodeSums({
    format: "stack_bar_chart",
    direction: otherDirection, // "origin"
    group_by: "Core_Capacity.name",
    preserve_stakeholder_groupings: false,
    filters: stackBarFilters,
  });

  // Get query results.
  setLoadingSpinnerOn(true);
  const results = await execute({ queries });

  // use first and only node result
  if (!isGhsaPage) results.nodeData = results.nodesData[id];
  else results.nodeData = { id: -9999, name: "GHSA" };

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
      setLoadingSpinnerOn={setLoadingSpinnerOn}
    />
  );
};

export default Details;
