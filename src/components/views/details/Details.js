import React from "react";
import styles from "./details.module.scss";
import { Settings } from "../../../App.js";
import {
  getWeightsBySummaryAttribute,
  getSummaryAttributeWeightsByNode
} from "../../misc/Data.js";
import Util from "../../misc/Util.js";
import FlowBundleQuery from "../../misc/FlowBundleQuery.js";

// Content components
import DetailsSection from "../../views/details/content/DetailsSection.js";
import FundsByYear from "../../chart/FundsByYear/FundsByYear.js";
import Donuts from "../../chart/Donuts/Donuts.js";
import StackBar from "../../chart/StackBar/StackBar.js";
import SimpleTable from "../../chart/table/SimpleTable.js";

// FC for Details.
const Details = ({ id, entityRole, data, flowTypeInfo, ...props }) => {
  // Track whether viewing committed or disbursed/provided assistance
  const [curFlowType, setCurFlowType] = React.useState("disbursed_funds");

  // Define other entity role, which is used in certain charts
  const otherEntityRole = entityRole === "funder" ? "recipient" : "funder";

  // Define the other node type based on the current entity role, which is used
  // in certain charts.
  const otherNodeType = entityRole === "funder" ? "target" : "source";
  console.log("data");
  console.log(data);
  // Return JSX
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
              flowType={curFlowType}
              attributeType={"core_elements"}
            />
          }
        />
        <DetailsSection
          header={<h2>Funding by core capacity</h2>}
          content={
            <StackBar
              data={getWeightsBySummaryAttribute({
                field: "core_capacities",
                flowTypes: ["disbursed_funds", "committed_funds"],
                data: data.flowBundles,
                byOtherNode: true,
                otherNodeType: otherNodeType
              })}
              flowType={curFlowType}
              attributeType={"core_capacities"}
              otherNodeType={otherNodeType}
            />
          }
        />
        <DetailsSection
          header={<h2>Top {otherEntityRole}s</h2>}
          content={
            <SimpleTable
              colInfo={[
                {
                  fmtName: otherNodeType,
                  get: d => d[otherNodeType],
                  display_name: Util.getInitCap(
                    Util.getRoleTerm({
                      type: "noun",
                      role: otherEntityRole
                    })
                  )
                },
                {
                  fmtName: curFlowType,
                  get: d => (d[curFlowType] ? d[curFlowType].total : undefined),
                  display_name: `Total ${
                    curFlowType === "disbursed_funds"
                      ? "disbursed"
                      : "committed"
                  }`
                },
                {
                  fmtName: curFlowType,
                  get: d => (d[curFlowType] ? d[curFlowType].P : undefined),
                  display_name: "Prevent"
                },
                {
                  fmtName: curFlowType,
                  get: d => (d[curFlowType] ? d[curFlowType].D : undefined),
                  display_name: "Detect"
                },
                {
                  fmtName: curFlowType,
                  get: d => (d[curFlowType] ? d[curFlowType].R : undefined),
                  display_name: "Respond"
                },
                {
                  fmtName: curFlowType,
                  get: d => (d[curFlowType] ? d[curFlowType].O : undefined),
                  display_name: "Other"
                },
                {
                  fmtName: curFlowType,
                  get: d =>
                    d[curFlowType]
                      ? d[curFlowType]["General IHR Implementation"]
                      : undefined,
                  display_name: "General IHR"
                },
                {
                  fmtName: curFlowType,
                  get: d =>
                    d[curFlowType] ? d[curFlowType]["Unspecified"] : undefined,
                  display_name: "Unspecified"
                }
              ]}
              data={getSummaryAttributeWeightsByNode({
                data: data.flowBundlesByNeighbor,
                field: "core_elements",
                flowTypes: ["disbursed_funds", "committed_funds"],
                nodeType: otherNodeType
              })}
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
