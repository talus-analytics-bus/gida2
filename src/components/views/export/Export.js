import React from "react";
import classNames from "classnames";
import styles from "./export.module.scss";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";
import Drawer from "../../common/Drawer/Drawer.js";
import Checkbox from "../../common/Checkbox/Checkbox.js";
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
  const [nRecords, setNRecords] = React.useState(0);
  const showClear =
    coreCapacities.length > 0 ||
    supportType.length > 0 ||
    funders.length > 0 ||
    recipients.length > 0;

  const cols = [
    ["project_name", "Project name"],
    ["description", "Project description"],
    ["data_sources", "Data source"],
    ["core_capacities", "Core capacities"],
    ["year_range", "Transaction year range"],
    ["source", "Funder"],
    ["target", "Recipient"],
    ["assistance_type", "Support type"],
    [
      "committed_funds",
      `Amount committed (${Settings.startYear} - ${Settings.endYear})`
    ],
    [
      "disbursed_funds",
      `Amount committed (${Settings.startYear} - ${Settings.endYear})`
    ]
  ];

  const [exportCols, setExportCols] = React.useState(cols.map(d => d[0]));

  const remove = (arr, aTmp) => {
    const a = aTmp;
    let what,
      L = a.length,
      ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax = arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  };

  const updateExportCols = value => {
    const shouldRemove = exportCols.includes(value);
    const editableExportCols = [...exportCols];

    if (shouldRemove)
      setExportCols(editableExportCols.filter(d => d !== value));
    else {
      editableExportCols.push(value);
      setExportCols(editableExportCols.sort());
    }
  };

  const dataTable = renderExportTable({
    ...{
      coreCapacities,
      supportType,
      funders,
      recipients,
      exportCols,
      setNRecords,
      component: exportTable,
      setComponent: setExportTable
    }
  });

  const filterTest = (
    <FilterDropdown
      {...{
        label: "",
        options: core_capacities,
        placeholder: "Funding by core capacity",
        onChange: setCoreCapacities
      }}
    />
  );

  const clearSelections = () => {
    setCoreCapacities([]);
    setSupportType([]);
    setFunders([]);
    setRecipients([]);
  };

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.Export)}>
      <Drawer
        {...{
          label: "Select data",
          content: (
            <div>
              <div>
                <div>Select filters to apply to selected data.</div>
                {showClear && (
                  <button onClick={clearSelections}>Clear selections</button>
                )}
              </div>
              <div>
                <FilterDropdown
                  {...{
                    label: "",
                    options: core_capacities,
                    placeholder: "Funding by core capacity",
                    onChange: setCoreCapacities,
                    curValues: coreCapacities
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
                    onChange: setSupportType,
                    curValues: supportType
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: data.entities,
                    placeholder: "Funder",
                    onChange: setFunders,
                    curValues: funders
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: data.entities,
                    placeholder: "Recipient",
                    onChange: setRecipients,
                    curValues: recipients
                  }}
                />
              </div>
              <hr />
              <div>
                <div>Choose data fields to include in table/download.</div>
                <div>
                  {cols.map(d => (
                    <Checkbox
                      {...{
                        label: d[1],
                        value: d[0],
                        curChecked: exportCols.includes(d[0]),
                        callback: updateExportCols
                      }}
                    />
                  ))}
                </div>
                <div>
                  <button>
                    {!showClear
                      ? `Download all available data (${Util.comma(nRecords)} ${
                          nRecords !== 1 ? "records" : "record"
                        })`
                      : `Download selected data (${Util.comma(nRecords)} ${
                          nRecords !== 1 ? "records" : "record"
                        })`}
                  </button>
                </div>
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
