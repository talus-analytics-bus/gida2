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
import { renderExportTable } from "./ExportTable.js";

// FC for Export.
const Export = ({ data, ...props }) => {
  const [coreCapacities, setCoreCapacities] = React.useState([]);
  const [supportType, setSupportType] = React.useState([]);
  const [funders, setFunders] = React.useState([]);
  const [recipients, setRecipients] = React.useState([]);
  const [exportTable, setExportTable] = React.useState(null);

  const dataTable = renderExportTable({
    ...{
      coreCapacities,
      supportType,
      funders,
      recipients,
      component: exportTable,
      setComponent: setExportTable
    }
  });

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
                    onChange: setCoreCapacities
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
                    onChange: setSupportType
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: data.entities,
                    placeholder: "Funder",
                    onChange: setFunders
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: data.entities,
                    placeholder: "Recipient",
                    onChange: setRecipients
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
    entities: NodeQuery({ setKeys: "value,label" })
  };

  // Get results in parallel
  const results = await Util.getQueryResults(queries);
  console.log("results - export page");
  console.log(results);

  // Set the component
  setComponent(<Export data={results} />);
};

export default Export;
