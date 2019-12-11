import React from "react";
import styles from "./details.module.scss";
import { Settings } from "../../../App.js";
import { getWeightsBySummaryAttribute } from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import FlowBundleQuery from "../../misc/FlowBundleQuery.js";

// Content components
import DetailsSection from "../../views/details/content/DetailsSection.js";
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js";
import Donuts from "../../chart/Donuts/Donuts.js";
// import FundsByCoreElement from "../../chart/FundsByCoreElement/FundsByCoreElement.js";

// FC for Details.
const Details = ({ id, entityRole, data, flowTypeInfo, ...props }) => {
  return (
    <div className={"pageContainer"}>
      <h1>
        {id} ({Util.getRoleTerm({ type: "noun", role: entityRole })} profile)
      </h1>
      <div className={styles.content}>
        <DetailsSection
          header={
            <h2>
              Total funds{" "}
              {Util.getRoleTerm({ type: "adjective", role: entityRole })} from{" "}
              {Settings.startYear} to {Settings.endYear}
            </h2>
          }
          content={
            <FundsByYear
              entityRole={entityRole}
              data={data.flowBundles[0]}
              flowTypeInfo={flowTypeInfo}
            />
          }
        />
        <DetailsSection
          header={<h2>Funding by core element</h2>}
          content={
            <Donuts
              data={getWeightsBySummaryAttribute({
                field: "core_elements",
                flowTypes: ["disbursed_funds", "committed_funds"],
                data: data.flowBundles
              })}
              flowType="disbursed_funds"
              attributeType={"core_elements"}
            />
          }
        />
        <DetailsSection
          header={<h2>Funding by core capacity</h2>}
          content={
            <Donuts
              data={getWeightsBySummaryAttribute({
                field: "core_capacities",
                flowTypes: ["disbursed_funds", "committed_funds"],
                data: data.flowBundles
              })}
              flowType="disbursed_funds"
              attributeType={"core_capacities"}
            />
          }
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
  entityRole
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
      entityRole: entityRole
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
 * @param  {[type]}       entityRole          [description]
 */
const getDetailsData = async ({ setDetailsComponent, id, entityRole }) => {
  const baseQueryParams = {
    focus_node_ids: [id],
    focus_node_type: entityRole === "recipient" ? "target" : "source",
    flow_type_ids: [1, 2, 3, 4],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,
    by_neighbor: true,
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
    <Details id={id} entityRole={entityRole} data={results} />
  );
};

export default Details;
