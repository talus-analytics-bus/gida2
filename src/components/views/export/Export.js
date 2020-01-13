import React from "react";
import classNames from "classnames";
import styles from "./export.module.scss";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";

// FC for Export.
const Export = ({ data, ...props }) => {
  console.log("export js");
  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.Export)}>
      Data export page placeholder
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
