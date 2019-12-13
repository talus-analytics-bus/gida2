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
  // TODO make key changes to the page if the id is special:
  // "ghsa" - Same as normal but include both a top funder and recipient table,
  //          and include only flows that are ghsa. Name of page is
  //          "Global Health Security Agenda (GHSA)" and entityRole is always
  //          funder.
  // "outbreak-response" - TBD

  // Get page type from id
  let pageType;
  if (id.toLowerCase() === "ghsa") pageType = "ghsa";
  else if (id.toLowerCase() === "outbreak-response")
    pageType = "outbreak-response";
  else pageType = "entity";

  // Define noun for entity role
  const entityRoleNoun = Util.getRoleTerm({ type: "noun", role: entityRole });

  // Define other entity role, which is used in certain charts
  const otherEntityRole = entityRole === "funder" ? "recipient" : "funder";

  // Define the other node type based on the current entity role, which is used
  // in certain charts.
  const otherNodeType = entityRole === "funder" ? "target" : "source";
  const nodeType = entityRole === "funder" ? "source" : "target";

  // Track whether viewing committed or disbursed/provided assistance
  const [curFlowType, setCurFlowType] = React.useState("disbursed_funds");

  // Get display name for current flow type
  const curFlowTypeName = flowTypeInfo.find(d => d.name === curFlowType)
    .display_name;

  // Track data for donuts
  const [donutData, setDonutData] = React.useState(
    getWeightsBySummaryAttribute({
      field: "core_elements",
      flowTypes: ["disbursed_funds", "committed_funds"],
      data: data.flowBundles
    })
  );

  // Track donut denominator value
  const getDonutDenominator = data => {
    // Assume that first flow bundle is what is needed
    const focusNodeBundle = data.flowBundles[0];

    // Return null if no data
    if (focusNodeBundle === undefined) return null;

    // Get focus node weight for flow type
    const flowTypeBundle = focusNodeBundle.flow_types[curFlowType];

    // If data not available, return null
    if (flowTypeBundle === undefined) return null;
    else {
      // otherwise, return the weight
      return flowTypeBundle.focus_node_weight;
    }
  };
  const [donutDenominator, setDonutDenominator] = React.useState(
    getDonutDenominator(data)
  );

  // Track the Top Recipients/Funders table data
  const [topTableData, setTopTableData] = React.useState(
    getSummaryAttributeWeightsByNode({
      data: data.flowBundlesByNeighbor,
      field: "core_elements",
      flowTypes: ["disbursed_funds", "committed_funds"],
      nodeType: otherNodeType
    })
  );

  // If on GHSA page, get "other" top table to display.
  const initTopTableDataOther = true
    ? // pageType === "ghsa"
      getSummaryAttributeWeightsByNode({
        data: data.flowBundlesByNeighbor,
        field: "core_elements",
        flowTypes: ["disbursed_funds", "committed_funds"],
        nodeType: nodeType
      })
    : null;
  const [topTableDataOther, setTopTableDataOther] = React.useState(
    initTopTableDataOther
  );

  console.log("topTableData");
  console.log(topTableData);

  // True if there are no data to show for the entire page, false otherwise.
  const noData = data.flowBundles[0] === undefined;

  // Return JSX
  return (
    <div className={"pageContainer"}>
      <h1>
        {id} ({entityRoleNoun} profile)
      </h1>

      {// Content if there is data available to show
      !noData && (
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
              <FundsByYear entityRole={entityRole} data={data.flowBundles[0]} />
            }
            curFlowType={curFlowType}
            setCurFlowType={setCurFlowType}
            flowTypeInfo={flowTypeInfo}
            toggleFlowType={false}
          />
          <DetailsSection
            header={<h2>Funding by core element</h2>}
            content={
              <Donuts
                data={donutData}
                flowType={curFlowType}
                attributeType={"core_elements"}
                donutDenominator={donutDenominator}
              />
            }
            curFlowType={curFlowType}
            setCurFlowType={setCurFlowType}
            flowTypeInfo={flowTypeInfo}
            toggleFlowType={true}
          />
          <DetailsSection
            header={<h2>Funding by core capacity</h2>}
            content={
              <StackBar
                data={getWeightsBySummaryAttribute({
                  field: "core_capacities",
                  flowTypes: ["disbursed_funds", "committed_funds"],
                  data: data.flowBundlesByNeighbor,
                  byOtherNode: true,
                  otherNodeType: otherNodeType
                })}
                flowType={curFlowType}
                flowTypeName={curFlowTypeName}
                attributeType={"core_capacities"}
                otherNodeType={otherNodeType}
              />
            }
            curFlowType={curFlowType}
            setCurFlowType={setCurFlowType}
            flowTypeInfo={flowTypeInfo}
            toggleFlowType={true}
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
                    get: d =>
                      d[curFlowType] ? d[curFlowType].total : undefined,
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
                      d[curFlowType]
                        ? d[curFlowType]["Unspecified"]
                        : undefined,
                    display_name: "Unspecified"
                  }
                ]}
                data={topTableData}
                hide={d => {
                  return d[curFlowType] !== undefined;
                }}
              />
            }
            curFlowType={curFlowType}
            setCurFlowType={setCurFlowType}
            flowTypeInfo={flowTypeInfo}
            toggleFlowType={true}
          />
          <DetailsSection
            header={<h2>Top {entityRole}s</h2>}
            content={
              <SimpleTable
                colInfo={[
                  {
                    fmtName: nodeType,
                    get: d => d[nodeType],
                    display_name: Util.getInitCap(
                      Util.getRoleTerm({
                        type: "noun",
                        role: entityRole
                      })
                    )
                  },
                  {
                    fmtName: curFlowType,
                    get: d =>
                      d[curFlowType] ? d[curFlowType].total : undefined,
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
                      d[curFlowType]
                        ? d[curFlowType]["Unspecified"]
                        : undefined,
                    display_name: "Unspecified"
                  }
                ]}
                data={topTableDataOther}
                hide={d => {
                  return d[curFlowType] !== undefined;
                }}
              />
            }
            curFlowType={curFlowType}
            setCurFlowType={setCurFlowType}
            flowTypeInfo={flowTypeInfo}
            toggleFlowType={true}
          />
        </div>
      )}
      {// Content if there is NOT data available to show
      noData && (
        <span>
          No funding data are currently available where {id} is a{" "}
          {entityRoleNoun}.
        </span>
      )}
    </div>
  );
};

export const renderDetails = ({
  detailsComponent,
  setDetailsComponent,
  loading,
  id,
  entityRole,
  flowTypeInfo
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
    getDetailsData({
      setDetailsComponent: setDetailsComponent,
      id: id,
      entityRole: entityRole,
      flowTypeInfo: flowTypeInfo
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
const getDetailsData = async ({
  setDetailsComponent,
  id,
  entityRole,
  flowTypeInfo
}) => {
  const baseQueryParams = {
    focus_node_ids: [id],
    focus_node_type: entityRole === "recipient" ? "target" : "source",
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

  // If GHSA page, add additional query
  if ()

  const results = await Util.getQueryResults(queries);

  setDetailsComponent(
    <Details
      id={id}
      entityRole={entityRole}
      data={results}
      flowTypeInfo={flowTypeInfo}
    />
  );
};

export default Details;
