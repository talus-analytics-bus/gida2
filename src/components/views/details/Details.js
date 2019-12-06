import React from "react";
import styles from "./details.module.scss";

// Content components
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import FlowBundleQuery from "../../misc/FlowBundleQuery.js";

// FC for Details.
const Details = ({ id, entityType, data, flowTypeInfo, ...props }) => {
  return (
    <div className={"pageContainer"}>
      <h1>
        {id} ({Util.getRoleTerm({ type: "noun", role: entityType })} profile)
      </h1>
      <div className={styles.content}>
        <FundsByYear
          startYear={Settings.startYear}
          endYear={Settings.endYear}
          entityType={entityType}
          data={data.flowBundles[0]}
          flowTypeInfo={flowTypeInfo}
        />
      </div>
    </div>
  );
};

export const renderDetails = ({
  detailsComponent,
  setDetailsComponent,
  loading,
  id,
  entityType
}) => {
  // Get data
  // FundsByYear, FundsByCoreElement:
  // http://localhost:5002/flow_bundles?focus_node_type=source&focus_node_ids=United%20States&flow_type_ids=1%2C2%2C3%2C4&by_neighbor=false

  if (loading) {
    return <div>Loading...</div>;
  } else if (
    detailsComponent === null ||
    (detailsComponent && detailsComponent.props.id !== id)
  ) {
    console.log("Getting details component");
    // // if no selected country, load the correct one based on the ID
    // const coverage = fillObservations.find(o => +o.place_id === +id)
    // const cases = bubbleObservations.find(o => +o.place_id === +id)

    getDetailsData({
      setDetailsComponent: setDetailsComponent,
      id: id,
      entityType: entityType
    });

    return <div />;
  } else {
    return detailsComponent;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for special detail pages like GHSA and response
 * @method getDetailsData
 * @param  {[type]}       setDetailsComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityType          [description]
 */
const getDetailsData = async ({ setDetailsComponent, id, entityType }) => {
  const baseQueryParams = {
    focus_node_ids: [id],
    focus_node_type: entityType === "recipient" ? "target" : "source",
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: false,
    filters: {},
    summaries: {
      parent_flow_info_summary: ["core_capacities", "core_elements"],
      datetime_summary: ["year"]
    }
  };
  const queries = {
    flowBundles: await FlowBundleQuery(baseQueryParams),
    flowBundlesByNeighbor: await FlowBundleQuery({
      ...baseQueryParams,
      by_neighbor: true
    })
  };
  const results = await Util.getQueryResults(queries);

  setDetailsComponent(
    <Details id={id} entityType={entityType} data={results} />
  );
};

export default Details;
