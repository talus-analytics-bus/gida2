import React from "react";
import classNames from "classnames";
import styles from "./export.module.scss";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";
import Drawer from "../../common/Drawer/Drawer.js";
import FilterDropdown from "../../common/FilterDropdown/FilterDropdown.js";
import { core_capacities } from "../../misc/Data.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";

// FC for Export.
const Export = ({ data, ...props }) => {
  const dataTable = (
    <TableInstance
      paging={true}
      tableColumns={[
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
          title: `Amount committed (${Settings.startYear} - ${
            Settings.endYear
          })`,
          prop: "committed_funds",
          type: "num",
          func: d =>
            d.flow_types.committed_funds !== undefined
              ? d.flow_types.committed_funds.focus_node_weight
              : "",
          render: d => Util.formatValue(d, "committed_funds")
        },
        {
          title: `Amount disbursed (${Settings.startYear} - ${
            Settings.endYear
          })`,
          prop: "disbursed_funds",
          type: "num",
          func: d =>
            d.flow_types.disbursed_funds !== undefined
              ? d.flow_types.disbursed_funds.focus_node_weight
              : "",
          render: d => Util.formatValue(d, "disbursed_funds")
        }
      ]}
      tableData={data.flows}
    />
  );
  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.Export)}>
      <Drawer
        {...{
          label: "Select data",
          content: (
            <div>
              <div>Select filters to apply to selected data.</div>
              <div>
                <FilterDropdown
                  {...{
                    label: "",
                    options: core_capacities,
                    placeholder: "Funding by core capacity",
                    onChange: () => console.log("Changed")
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: [
                      { value: "financial", label: "Direct financial support" },
                      { value: "inkind", label: "In-kind support" }
                    ],
                    placeholder: "Support type",
                    onChange: () => console.log("Changed")
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: data.entities,
                    placeholder: "Funder",
                    onChange: () => console.log("Changed")
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: data.entities,
                    placeholder: "Recipient",
                    onChange: () => console.log("Changed")
                  }}
                />
              </div>
            </div>
          )
        }}
      />
      {dataTable}
    </div>
  );
};

export const renderExport = ({ component, setComponent, loading }) => {
  // Get data
  if (loading) {
    return <div>Loading...</div>;
  } else if (component === null) {
    getComponentData({
      setComponent: setComponent
    });

    return component ? component : <div />;
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
const getComponentData = async ({ setComponent }) => {
  // Set base query params for FlowBundleFocusQuery and FlowBundleGeneralQuery

  const baseQueryParams = {
    focus_node_ids: null,
    focus_node_type: "source",
    flow_type_ids: [5],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,

    // Add filters as appropriate.
    filters: {}
  };

  // Set base query params for FlowQuery
  const baseFlowQueryParams = JSON.parse(JSON.stringify(baseQueryParams));

  // Define queries for typical Export page.
  const queries = {
    // Information about the entity
    entities: NodeQuery({ setKeys: "value,label" }),
    flows: FlowQuery({
      ...baseFlowQueryParams,
      flow_type_ids: [5]
    })
  };

  // Get results in parallel
  const results = await Util.getQueryResults(queries);
  console.log("results - export page");
  console.log(results);

  // Set the component
  setComponent(<Export data={results} />);
};

export default Export;
