import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./entitytable.module.scss";
import { Settings } from "../../../App.js";
import {
  getWeightsBySummaryAttribute,
  getNodeLinkList,
} from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import { execute, Stakeholder, NodeSums, Flow } from "../../misc/Queries";
import FlowQuery from "../../misc/FlowQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";
import Tab from "../../misc/Tab.js";
import GhsaToggle from "../../misc/GhsaToggle.js";
import EntityRoleToggle from "../../misc/EntityRoleToggle.js";
import Loading from "../../common/Loading/Loading.js";
import SourceText from "../../common/SourceText/SourceText.js";
import Button from "../../common/Button/Button.js";
import DataTable from "../../chart/table/DataTable/DataTable.js";

// FC for EntityTable.
const EntityTable = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  otherId,
  setLoadingSpinnerOn,
  setComponent,
  getTableDataFuncs,
  ...props
}) => {
  // Get page type from id
  let pageType;
  if (id.toString().toLowerCase() === "ghsa") pageType = "ghsa";
  else pageType = "entity";

  // If allowing pair tables, use correct pair table slug for routing.
  const ENABLE_PAIR_TABLES = false;
  const pairTableSlug = ENABLE_PAIR_TABLES ? "pair-table" : "table";

  // List of all flow types
  const allFlowTypes = [
    "disbursed_funds",
    "committed_funds",
    "provided_inkind",
    "committed_inkind",
  ];

  /**
   * Returns column definitions for all assistance types for use in
   * TableInstance
   * @method getAssistanceTableCols
   * @param  {[type]}               flowTypeInfo [description]
   * @return {[type]}                            [description]
   */
  const getAssistanceTableCols = flowTypeInfo => {
    return allFlowTypes.map(ft => {
      const match = flowTypeInfo.find(d => d.name === ft);
      return {
        title: `${match.display_name} (${Settings.startYear} - ${
          Settings.endYear
        })`,
        prop: match.name,
        render: val => Util.formatValue(val, match.name),
        type: "num",
        className: d => (d > 0 ? "num" : "num-with-text"),
        func: d => d[ft] || undefined,
      };
    });
  };

  // Define other entity role, which is used in certain charts
  const otherEntityRole = entityRole === "funder" ? "recipient" : "funder";

  // Define funder/recipient columns to be displayed as appropriate.
  const funderCol = {
    title: "Funder",
    prop: "origin",
    type: "text",
    func: d => JSON.stringify(d.origin),
    render: d =>
      getNodeLinkList({
        urlType:
          entityRole === "funder" || pageType === "ghsa"
            ? "table"
            : pairTableSlug,
        nodeList: JSON.parse(d),
        entityRole: "funder",
        id: id,
        otherId: otherId,
      }),
  };

  const recipientCol = {
    title: "Recipient",
    prop: "target",
    type: "text",
    func: d => JSON.stringify(d.target),
    render: d =>
      getNodeLinkList({
        urlType:
          entityRole === "recipient" || pageType === "ghsa"
            ? "table"
            : pairTableSlug,
        nodeList: JSON.parse(d),
        entityRole: "recipient",
        id: id,
        otherId: otherId,
      }),
  };

  const [inkindCount, setInkindCount] = useState(null);
  const [financialCount, setFinancialCount] = useState(null);

  // tableData={data.flows.flows.filter(f =>
  //   f.flow_info.assistance_type.toLowerCase().includes("financial")
  // )}
  const sections = [
    {
      header: <>All funds{financialCount}</>,
      slug: "all",
      content: (
        <DataTable
          noNativePaging={true}
          noNativeSearch={true}
          noNativeSorting={true}
          getTableData={getTableDataFuncs.flowsFinancial}
          pageSize={10}
          rowCount={financialCount}
          setRowCount={setFinancialCount}
          tableColumns={[
            {
              title: "Funder",
              prop: "origin",
              type: "text",
              func: d => JSON.stringify(d.origins),
              render: d =>
                getNodeLinkList({
                  urlType:
                    entityRole === "funder" || pageType === "ghsa"
                      ? "table"
                      : pairTableSlug,
                  nodeList: JSON.parse(d),
                  entityRole: "funder",
                  id: id,
                  otherId: otherId,
                }),
            },
            {
              title: "Recipient",
              prop: "target",
              type: "text",
              func: d => JSON.stringify(d.targets),
              render: d =>
                getNodeLinkList({
                  urlType:
                    entityRole === "recipient" || pageType === "ghsa"
                      ? "table"
                      : pairTableSlug,
                  nodeList: JSON.parse(d),
                  entityRole: "recipient",
                  id: id,
                  otherId: otherId,
                }),
            },
            {
              title: "Project name",
              func: d => d.name,
              type: "text",
              prop: "name",
              render: val => Util.formatValue(val, "project_name"),
            },
            {
              title: `Committed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d => d.committed_funds,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "committed_funds",
              render: val => Util.formatValue(val, "committed_funds"),
              defaultContent: "n/a",
            },
            {
              title: `Disbursed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d => d.disbursed_funds,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "disbursed_funds",
              render: val => Util.formatValue(val, "disbursed_funds"),
              defaultContent: "n/a",
            },
          ]}
          setLoadingSpinnerOn={setLoadingSpinnerOn}
          sortByProp={"disbursed_funds"}
        />
      ),
    },
    {
      header: "Funds by " + otherEntityRole, // TODO other role
      slug: "funds_by_other",
      content: (
        <TableInstance
          paging={true}
          sortByProp={"disbursed_funds"}
          tableColumns={[
            otherEntityRole === "funder" ? funderCol : recipientCol,
            {
              title: `Committed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d => d.committed_funds,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "committed_funds",
              render: val => Util.formatValue(val, "committed_funds"),
              defaultContent: "n/a",
            },
            {
              title: `Disbursed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d => d.disbursed_funds,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "disbursed_funds",
              render: val => Util.formatValue(val, "disbursed_funds"),
              defaultContent: "n/a",
            },
          ]}
          tableData={data.fundsByOther.filter(
            f =>
              f.committed_funds !== undefined || f.disbursed_funds !== undefined
          )}
        />
      ),
    },
    {
      header: "Funds by " + entityRole, // TODO other role
      slug: "funds_by_same",
      show: id === "ghsa",
      content: id === "ghsa" && (
        <TableInstance
          paging={true}
          sortByProp={"disbursed_funds"}
          tableColumns={[
            otherEntityRole === "funder" ? recipientCol : funderCol,
            {
              title: `Committed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d => d.committed_funds,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "committed_funds",
              render: val => Util.formatValue(val, "committed_funds"),
              defaultContent: "n/a",
            },
            {
              title: `Disbursed funds (${Settings.startYear} - ${
                Settings.endYear
              })`,
              func: d => d.disbursed_funds,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "disbursed_funds",
              render: val => Util.formatValue(val, "disbursed_funds"),
              defaultContent: "n/a",
            },
          ]}
          tableData={data.fundsBySame.filter(
            f =>
              f.committed_funds !== undefined || f.disbursed_funds !== undefined
          )}
        />
      ),
    },
    {
      header: "Funds by core element",
      slug: "ce",
      content: (
        <TableInstance
          sortByProp={"disbursed_funds"}
          tableColumns={[
            {
              title: "Core element",
              prop: "attribute",
            },
          ].concat(getAssistanceTableCols(flowTypeInfo))}
          tableData={data.fundsByCE}
        />
      ),
    },
    {
      header: "Funds by core capacity",
      slug: "cc",
      content: (
        <TableInstance
          sortByProp={"disbursed_funds"}
          tableColumns={[
            {
              title: "Core capacity",
              prop: "attribute",
            },
          ].concat(getAssistanceTableCols(flowTypeInfo))}
          tableData={data.fundsByCC}
        />
      ),
    },
    {
      header: <>In-kind contributions{inkindCount}</>,
      slug: "in-kind",
      show: inkindCount === null || inkindCount.props["data-count"] !== 0,
      content: (
        <DataTable
          noNativePaging={true}
          noNativeSearch={true}
          noNativeSorting={true}
          getTableData={getTableDataFuncs.flowsInkind}
          pageSize={10}
          sortByProp={"provided_inkind"}
          setLoadingSpinnerOn={setLoadingSpinnerOn}
          tableColumns={[
            {
              title: "Provider",
              prop: "origin",
              type: "text",
              func: d => JSON.stringify(d.origins),
              render: d =>
                getNodeLinkList({
                  urlType:
                    entityRole === "funder" || pageType === "ghsa"
                      ? "table"
                      : pairTableSlug,
                  nodeList: JSON.parse(d),
                  entityRole: "funder",
                  id: id,
                  otherId: otherId,
                }),
            },
            {
              title: "Recipient",
              prop: "target",
              type: "text",
              func: d => JSON.stringify(d.targets),
              render: d =>
                getNodeLinkList({
                  urlType:
                    entityRole === "recipient" || pageType === "ghsa"
                      ? "table"
                      : pairTableSlug,
                  nodeList: JSON.parse(d),
                  entityRole: "recipient",
                  id: id,
                  otherId: otherId,
                }),
            },
            {
              title: "Project name",
              func: d => d.name,
              type: "text",
              prop: "name",
            },
            {
              title: "Total years project committed",
              func: d => d.committed_inkind,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "committed_inkind",
              render: val => Util.formatValue(val, "inkind"),
              defaultContent: "n/a",
            },
            {
              title: "Total years project provided",
              func: d => d.provided_inkind,
              type: "num",
              className: d => (d > 0 ? "num" : "num-with-text"),
              prop: "provided_inkind",
              render: val => Util.formatValue(val, "inkind"),
              defaultContent: "n/a",
            },
          ]}
          rowCount={inkindCount}
          setRowCount={setInkindCount}
        />
      ),
    },
  ];

  // Track currently visible tab
  const [curTab, setCurTab] = useState(sections[0].slug);

  // clear counts when id or type changes
  useEffect(() => {
    setInkindCount(null);
    setFinancialCount(null);
  }, [id, ghsaOnly]);

  // update tab when stakeholder changes if needed
  useEffect(() => {
    if (inkindCount !== null && financialCount !== null) {
      const newInitTabIdx =
        inkindCount.props["data-count"] === 0 ||
        financialCount.props["data-count"] !== 0
          ? 0
          : sections.length - 1;
      setCurTab(sections[newInitTabIdx].slug);
    }
  }, [inkindCount, financialCount]);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.entityTable)}>
      {otherId === undefined && (
        <div className={styles.header}>
          <div className={styles.upper}>
            <h1>
              {data.nodeData.name}{" "}
              {!data.nodeData.name && (
                <div className={styles.ghsa}>
                  <img src={"/flags/ghsa.png"} />
                  GHSA
                </div>
              )}
            </h1>
            <Button
              type={"secondary"}
              linkTo={
                id !== "ghsa"
                  ? `/details/${id}/${entityRole}` || "funder"
                  : "/details/ghsa"
              }
              style={{ right: 0 }}
              label={"Back to summary"}
            />
          </div>
          {pageType !== "ghsa" && (
            <div className={styles.lower}>
              {pageType !== "ghsa" && (
                <GhsaToggle
                  horizontal={true}
                  ghsaOnly={ghsaOnly}
                  setGhsaOnly={setGhsaOnly}
                />
              )}
              <EntityRoleToggle
                entityRole={entityRole}
                redirectUrlFunc={v => `/table/${id}/${v}`}
              />
            </div>
          )}
        </div>
      )}
      {otherId !== undefined && (
        <div className={styles.header}>
          <div className={styles.upper}>
            <Button
              type={"secondary"}
              linkTo={`/table/${id}/funder`}
              label={"Go to funder table"}
              style={{ left: 0 }}
            />
            <h1>
              {data.nodeData.name} → {data.nodeDataOther.name}
            </h1>
            <Button
              type={"secondary"}
              linkTo={`/table/${otherId}/recipient`}
              style={{ right: 0 }}
              label={"Go to recipient table"}
            />
          </div>
          <div className={styles.lower}>
            {pageType !== "ghsa" && (
              <GhsaToggle
                horizontal={true}
                ghsaOnly={ghsaOnly}
                setGhsaOnly={setGhsaOnly}
              />
            )}
          </div>
        </div>
      )}
      <div className={styles.tabs}>
        {sections
          .filter(s => s.show !== false)
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
      <div className={styles.content}>
        {sections.map(s => (
          <Tab selected={curTab === s.slug} content={s.content} />
        ))}
      </div>
    </div>
  );
};

export const renderEntityTable = ({
  component,
  setComponent,
  loading,
  id,
  otherId,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  setLoadingSpinnerOn,
}) => {
  // Set ID values to correct types
  if (id !== "ghsa" && id !== undefined) id = parseInt(id);
  if (otherId !== undefined) otherId = parseInt(otherId);

  // Get data
  if (loading) {
    return <div className={"placeholder"} />;
  } else if (
    component === null ||
    (component &&
      (component.props.id !== id ||
        component.props.otherId !== otherId ||
        component.props.entityRole !== entityRole ||
        component.props.ghsaOnly !== ghsaOnly))
  ) {
    getComponentData({
      setComponent: setComponent,
      id: id,
      otherId: otherId,
      entityRole: entityRole,
      flowTypeInfo: flowTypeInfo,
      ghsaOnly: ghsaOnly,
      setGhsaOnly: setGhsaOnly,
      setLoadingSpinnerOn,
    });

    return component ? (
      <EntityTable
        {...{
          ...component.props,
          key: component.props.id,
          getTableDataFuncs: {},
        }}
      />
    ) : (
      <Loading margin={20}>
        <div className={"placeholder"} />
      </Loading>
    );
    // return component ? component : <div className={"placeholder"}/>;
  } else {
    return component;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for special detail pages like GHSA and response
 * @method getComponentData
 * @param  {[type]}       setDetailsComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityRole          [description]
 */
const getComponentData = async ({
  setComponent,
  id,
  otherId,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  setLoadingSpinnerOn,
}) => {
  // Set base query params for FlowBundleFocusQuery and FlowBundleGeneralQuery
  let nodeType;
  if (entityRole === undefined) {
    if (id === "ghsa") {
      nodeType = "target";
    } else if (otherId !== undefined) {
      nodeType = "origin";
    } else {
      console.error("[ERROR] Node type is undefined in EntityTable.js");
    }
  } else {
    nodeType = entityRole === "funder" ? "origin" : "target";
  }

  const otherNodeType = nodeType === "target" ? "origin" : "target";
  const filterNodeType = nodeType + "s";
  const filterNodeTypeOther = otherNodeType + "s";

  if (isNaN(otherId)) otherId = undefined;
  const baseQueryParams = {
    focus_node_ids: id !== "ghsa" ? [id] : null,
    focus_node_type: id !== "ghsa" ? nodeType : otherNodeType,
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: false,
    pair_node_id: otherId,

    // Add filters as appropriate.
    filters:
      // If not GHSA page,
      id !== "ghsa"
        ? // And the "other ID" (recipient) of a pair has been defined,
          otherId !== undefined
          ? // Then include filters for source and target as appropriate TODO confirm this works
            {
              place_filters: [[nodeType, id], [otherNodeType, otherId]],
            }
          : // Otherwise, only filter by one of those (source or target)
            { place_filters: [[nodeType, id]] }
        : {},
    summaries: {
      parent_flow_info_summary: ["core_capacities", "core_elements"],
      datetime_summary: ["year"],
    },
    include_master_summary: true,
  };

  // If GHSA page, then filter by GHSA.
  baseQueryParams.filters.parent_flow_info_filters = [];
  if (id === "ghsa" || ghsaOnly === "true") {
    baseQueryParams.filters.parent_flow_info_filters.push([
      "ghsa_funding",
      "True",
    ]);
  } else if (ghsaOnly === "event") {
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

  // Set base query params for FlowQuery
  const baseFlowQueryParams = {
    financial: JSON.parse(JSON.stringify(baseQueryParams)),
    inkind: JSON.parse(JSON.stringify(baseQueryParams)),
  };
  baseFlowQueryParams.financial.filters.flow_info_filters = [];
  baseFlowQueryParams.inkind.filters.flow_info_filters = [];

  baseFlowQueryParams.financial.filters.flow_info_filters.push([
    "assistance_type",
    "financial",
  ]);
  baseFlowQueryParams.inkind.filters.flow_info_filters.push([
    "assistance_type",
    "inkind",
  ]);
  const isGhsaPage = id === "ghsa";

  const nodeSumsFilters = {
    "Flow.year": [["gt_eq", Settings.startYear], ["lt_eq", Settings.endYear]],
    "Stakeholder.subcat": [["neq", ["sub-organization", "agency"]]],
  };
  const flowFilters = {
    "Project_Constants.min_year": [["gt_eq", Settings.startYear]],
  };

  if (isGhsaPage) {
    flowFilters["Project_Constants.is_ghsa"] = [true];
    nodeSumsFilters["Flow.is_ghsa"] = [true];
  }

  // add assistance type filter
  if (ghsaOnly === "true") {
    nodeSumsFilters["Flow.is_ghsa"] = [true];
    flowFilters["Project_Constants.is_ghsa"] = [true];
  } else if (ghsaOnly === "event") {
    nodeSumsFilters["Flow.response_or_capacity"] = ["response"];
    flowFilters["Project_Constants.response_or_capacity"] = ["response"];
  } else if (ghsaOnly === "capacity") {
    nodeSumsFilters["Flow.response_or_capacity"] = ["capacity"];
    flowFilters["Project_Constants.response_or_capacity"] = ["capacity"];
  }

  // Define queries for typical entityTable page.
  const direction = entityRole === "funder" ? "origin" : "target";
  const otherDirection = entityRole === "funder" ? "target" : "origin";

  // if GHSA page, then alter filters accordingly
  const nodeSumsFiltersDirection = {
    [direction]: { ...nodeSumsFilters },
    [otherDirection]: { ...nodeSumsFilters },
  };
  if (!isGhsaPage) {
    nodeSumsFiltersDirection[direction]["Stakeholder.id"] = [id];
    nodeSumsFiltersDirection[otherDirection]["OtherStakeholder.id"] = [id];
  } else {
    nodeSumsFiltersDirection[direction]["Flow.is_ghsa"] = [true];
    nodeSumsFiltersDirection[otherDirection]["Flow.is_ghsa"] = [true];
  }

  const queries = {
    // Information about the entity
    nodeData: Stakeholder({ id }),

    // General flow bundles by neighbor, for funder/recipient tables.
    fundsByOther: NodeSums({
      format: "table",
      direction: otherDirection,
      filters: nodeSumsFiltersDirection[otherDirection],
    }),
    fundsByCC: NodeSums({
      format: "table_by_grouped_attr",
      group_by: "Core_Capacity.name",
      direction,
      filters: nodeSumsFiltersDirection[direction],
    }),
    fundsByCE: NodeSums({
      format: "table_by_grouped_attr",
      group_by: "Core_Element.name",
      direction,
      filters: nodeSumsFiltersDirection[direction],
    }),
  };

  if (isGhsaPage) {
    queries.fundsBySame = NodeSums({
      format: "table",
      direction,
      filters: nodeSumsFiltersDirection[direction],
    });
  }

  const getTableDataFuncs = {
    flowsFinancial: (page, pagesize) => {
      return Flow({
        page,
        pagesize,
        [nodeType + "Ids"]: !isGhsaPage ? [id] : undefined,
        format: ["stakeholder_details"],
        filters: {
          ...flowFilters,
          "Project_Constants.is_inkind": [false],
        },
      });
    },
    flowsInkind: (page, pagesize) => {
      return Flow({
        page,
        pagesize,
        [nodeType + "Ids"]: !isGhsaPage ? [id] : undefined,
        format: ["stakeholder_details"],
        filters: {
          ...flowFilters,
          "Project_Constants.is_inkind": [true],
        },
      });
    },
  };

  // If "other ID" specified, get its node data as well.
  if (otherId !== undefined) {
    queries["nodeDataOther"] = Stakeholder({ id: otherId });
  }

  // TODO implement GHSA version of page

  // Get results in parallel
  // setLoadingSpinnerOn(true);
  const results = await execute({ queries });

  results.nodeData = results.nodeData.length > 0 ? results.nodeData[0] : {};

  // Set the component
  setComponent(
    <EntityTable
      id={id}
      otherId={otherId}
      entityRole={entityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
      ghsaOnly={ghsaOnly}
      setGhsaOnly={setGhsaOnly}
      setComponent={setComponent}
      setLoadingSpinnerOn={setLoadingSpinnerOn}
      getTableDataFuncs={getTableDataFuncs}
    />
  );
};

export default EntityTable;
