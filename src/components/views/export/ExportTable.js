import React from "react";
import classNames from "classnames";
import styles from "./exporttable.module.scss";
import { Settings } from "../../../App.js";
import { execute, Flow } from "../../misc/Queries";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";
import Chevron from "../../common/Chevron/Chevron.js";
import Pagination from "../../common/Pagination/Pagination.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";

// FC for ExportTable.
const ExportTable = ({
  data,
  exportCols,
  curPage,
  setCurPage,
  stakeholders,
  ...props
}) => {
  // Set n records
  props.setNRecords(data.flows.paging.n_records);

  // Currently unused, will be used for dynamic page size selection.
  const [curPageSize, setCurPageSize] = React.useState(5);

  React.useEffect(() => setCurPage(1), [
    props.coreCapacities,
    props.funders,
    props.recipients,
    props.outbreaks,
    props.supportType,
  ]);

  const cols = [
    {
      title: "Project name",
      prop: "name",
      type: "text",
      func: d => d.name,
    },
    {
      title: "Project description",
      prop: "desc",
      type: "text",
      func: d => d.desc,
    },
    {
      title: "Data source",
      prop: "sources",
      type: "text",
      func: d =>
        d.sources !== undefined
          ? d.sources.filter(dd => dd.trim() !== "").join("; ")
          : "",
    },
    {
      title: "Core capacities",
      prop: "ccs",
      type: "text",
      func: d => (d.ccs ? d.ccs.join("; ") : ""),
    },
    {
      title: "Transaction year range",
      prop: "years",
      type: "text",
      func: d => (d.years ? d.years : ""),
    },
    {
      title: (
        <div className={styles.row}>
          <Chevron type={"funder"} />
          <div>Funder</div>
        </div>
      ),
      prop: "origins",
      type: "text",
      func: d => d.origins.map(dd => stakeholders[dd].name).join("; "),
    },
    {
      title: (
        <div className={styles.row}>
          <Chevron type={"recipient"} />
          <div>Recipient</div>
        </div>
      ),
      prop: "targets",
      type: "text",
      func: d => d.targets.map(dd => stakeholders[dd].name).join("; "),
    },
    {
      title: "Support type",
      prop: "assistance_type",
      type: "text",
      func: d => {
        if (!d.is_inkind) return "Financial assistance";
        else return "In-kind support";
      },
    },
    {
      title: `Amount committed`,
      prop: "committed_funds",
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      func: d => (d.committed_funds !== null ? d.committed_funds : ""),
      render: d => Util.formatValue(d, "committed_funds"),
    },
    {
      title: `Amount disbursed`,
      prop: "disbursed_funds",
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      func: d => (d.disbursed_funds !== null ? d.disbursed_funds : ""),
      render: d => Util.formatValue(d, "disbursed_funds"),
    },
  ].filter(d => exportCols.includes(d.prop));

  const dataTable = (
    <TableInstance
      noNativePaging={true}
      noNativeSearch={true}
      noNativeSorting={true}
      tableColumns={cols}
      tableData={data.flows.data}
    />
  );
  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.exportTable)}>
      {
        <div>
          {
            <Pagination
              {...{
                curPage,
                setCurPage,
                setCurPageSize,
                nPages: data.flows.paging.n_pages,
              }}
            />
          }
        </div>
      }
      {dataTable}
    </div>
  );
};

const remountComponent = ({ component, ...props }) => {
  const remount =
    component === null ||
    component.props.coreCapacities.toString() !==
      props.coreCapacities.toString() ||
    component.props.funders.toString() !== props.funders.toString() ||
    component.props.curPage.toString() !== props.curPage.toString() ||
    component.props.outbreaks.toString() !== props.outbreaks.toString() ||
    component.props.supportType.toString() !== props.supportType.toString() ||
    component.props.recipients.toString() !== props.recipients.toString();

  return remount;
};

export const renderExportTable = ({
  component,
  setComponent,
  loading,
  setLoadingSpinnerOn,
  curPage,
  setCurPage,
  ...props
}) => {
  // Get data
  if (loading) {
    return <div className={"placeholder"} />;
  } else if (remountComponent({ component, curPage, ...props })) {
    getComponentData({
      setComponent: setComponent,
      setLoadingSpinnerOn,
      curPage,
      setCurPage,
      ...props,
    });

    return component ? component : <div className={"placeholder"} />;
  } else if (
    component.props.exportCols.toString() !== props.exportCols.toString()
  ) {
    setComponent(
      <ExportTable {...{ ...component.props, exportCols: props.exportCols }} />
    );
  } else {
    setLoadingSpinnerOn(false);
    return component;
  }
};

export const getFlowQuery = ({ curPage, ...props }) => {
  return FlowQuery({
    ...getFlowQueryParams({ curPage, ...props }),
    flow_type_ids: [5],
  });
};

export const getFlowQueryParams = ({ curPage, ...props }) => {
  // Set base query params for FlowBundleFocusQuery and FlowBundleGeneralQuery
  const baseQueryParams = {
    focus_node_ids: null,
    focus_node_type: "source",
    flow_type_ids: [5],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    page_size: 10,
    page: curPage,
    for_export: props.forExport === true,
    paramsOnly: props.paramsOnly === true,

    // Add filters as appropriate.
    filters: {},
  };

  // If funders specified, filter
  const placeFilterTypes = [["funders", "source"], ["recipients", "target"]];
  placeFilterTypes.forEach(type => {
    if (props[type[0]].length > 0) {
      baseQueryParams.filters.place_filters.push(
        [type[1]].concat(props[type[0]].map(d => d.value))
      );
    }
  });

  // Flow info filters
  const flowInfoFilters = [
    ["supportType", "assistance_type"],
    ["coreCapacities", "core_capacities"],
    ["outbreaks", "outbreak_id"],
  ];
  flowInfoFilters.forEach(type => {
    if (props[type[0]].length > 0) {
      baseQueryParams.filters.flow_info_filters.push(
        [type[1]].concat(props[type[0]].map(d => d.value))
      );
    }
  });

  // Set base query params for FlowQuery
  return baseQueryParams;
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
  setLoadingSpinnerOn,
  curPage,
  setCurPage,
  ...props
}) => {
  // Define queries for typical ExportTable page.
  const flowFilters = {};

  // CCs
  if (props.coreCapacities.length > 0) {
    flowFilters["Project.core_capacities"] = [
      ["any", props.coreCapacities.map(d => d.value)],
    ];
  }

  // assistance type
  if (props.supportType.length === 1) {
    flowFilters["Project.is_inkind"] = [
      props.supportType[0].value === "inkind",
    ];
  }

  const queries = {
    // Information about the entity
    flows: Flow({
      filters: flowFilters,
      originIds: props.funders.map(d => d.value),
      targetIds: props.recipients.map(d => d.value),
      pagesize: 10,
      page: curPage,
    }),
  };

  // Get results in parallel
  setLoadingSpinnerOn(true);
  const results = await Util.getQueryResults(queries);

  // Set the component
  setComponent(
    <ExportTable
      {...{
        data: results,
        curPage,
        setCurPage,
        exportCols: props.exportCols,
        ...props,
      }}
    />
  );
};

export default ExportTable;
