import React from "react";
import classNames from "classnames";
import styles from "./exporttable.module.scss";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";

// FC for ExportTable.
const ExportTable = ({ data, exportCols, ...props }) => {
  // Set n records
  props.setNRecords(data.flows.length);

  const cols = [
    {
      title: "Project name",
      prop: "project_name",
      type: "text",
      func: d => d.flow_info.project_name
    },
    {
      title: "Project description",
      prop: "description",
      type: "text",
      func: d => d.flow_info.description
    },
    {
      title: "Data source",
      prop: "data_sources",
      type: "text",
      func: d => d.data_sources.filter(dd => dd.trim() !== "").join("; ")
    },
    {
      title: "Core capacities",
      prop: "core_capacities",
      type: "text",
      func: d => d.flow_info.core_capacities.join("; ")
    },
    {
      title: "Transaction year range",
      prop: "year_range",
      type: "text",
      func: d => (d.year_range ? d.year_range : "")
    },
    {
      title: "Funder",
      prop: "source",
      type: "text",
      func: d => d.source.map(dd => dd.name).join("; ")
    },
    {
      title: "Recipient",
      prop: "target",
      type: "text",
      func: d => d.target.map(dd => dd.name).join("; ")
    },
    {
      title: "Support type",
      prop: "assistance_type",
      type: "text",
      func: d =>
        d.flow_info.assistance_type == "financial"
          ? "Direct financial support"
          : "In-kind support"
    },
    {
      title: `Amount committed (${Settings.startYear} - ${Settings.endYear})`,
      prop: "committed_funds",
      type: "num",
      func: d =>
        d.flow_types.committed_funds !== undefined
          ? d.flow_types.committed_funds.focus_node_weight
          : "",
      render: d => Util.formatValue(d, "committed_funds")
    },
    {
      title: `Amount disbursed (${Settings.startYear} - ${Settings.endYear})`,
      prop: "disbursed_funds",
      type: "num",
      func: d =>
        d.flow_types.disbursed_funds !== undefined
          ? d.flow_types.disbursed_funds.focus_node_weight
          : "",
      render: d => Util.formatValue(d, "disbursed_funds")
    }
  ].filter(d => exportCols.includes(d.prop));

  const dataTable = (
    <TableInstance paging={true} tableColumns={cols} tableData={data.flows} />
  );
  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.exportTable)}>
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
    component.props.supportType.toString() !== props.supportType.toString() ||
    component.props.recipients.toString() !== props.recipients.toString();

  return remount;
};

export const renderExportTable = ({
  component,
  setComponent,
  loading,
  ...props
}) => {
  // Get data
  if (loading) {
    return <div>Loading...</div>;
  } else if (remountComponent({ component, ...props })) {
    getComponentData({
      setComponent: setComponent,
      ...props
    });

    return component ? component : <div />;
  } else if (
    component.props.exportCols.toString() !== props.exportCols.toString()
  ) {
    console.log("Updating component because export columns were changed.");
    setComponent(
      <ExportTable {...{ ...component.props, exportCols: props.exportCols }} />
    );
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
const getComponentData = async ({ setComponent, ...props }) => {
  // Set base query params for FlowBundleFocusQuery and FlowBundleGeneralQuery

  const baseQueryParams = {
    focus_node_ids: null,
    focus_node_type: "source",
    flow_type_ids: [5],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,

    // Add filters as appropriate.
    filters: { place_filters: [], flow_info_filters: [] }
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
    ["coreCapacities", "core_capacities"]
  ];
  flowInfoFilters.forEach(type => {
    if (props[type[0]].length > 0) {
      baseQueryParams.filters.flow_info_filters.push(
        [type[1]].concat(props[type[0]].map(d => d.value))
      );
    }
  });

  // Set base query params for FlowQuery
  const baseFlowQueryParams = JSON.parse(JSON.stringify(baseQueryParams));

  // Define queries for typical ExportTable page.
  const queries = {
    // Information about the entity
    flows: FlowQuery({
      ...baseFlowQueryParams,
      flow_type_ids: [5]
    })
  };

  // Get results in parallel
  const results = await Util.getQueryResults(queries);
  console.log("results - export table");
  console.log(results);

  // Set the component
  setComponent(
    <ExportTable
      {...{ data: results, exportCols: props.exportCols, ...props }}
    />
  );
};

export default ExportTable;