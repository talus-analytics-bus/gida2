import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import axios from "axios";
import Modal from "reactjs-popup";
import classNames from "classnames";
import * as d3 from "d3/dist/d3.min";
import ReactTooltip from "react-tooltip";
import BrowserDetection from "react-browser-detection";

// layout
import Nav from "./components/layout/nav/Nav.js";
import Footer from "./components/layout/footer/Footer.js";

// map
import Map from "./components/map/Map";
import Util from "./components/misc/Util.js";

// views
import { Details, renderDetails } from "./components/views/details/Details.js";
import Global from "./components/views/global/Global.js";
import About from "./components/views/about/About.js";

// styles
import styles from "./App.module.scss";
import "./components/views/details/details.module.scss";
import infoTooltipStyles from "./components/misc/infotooltip.module.scss";
import "material-design-icons/iconfont/material-icons.css";

// queries
import FlowBundleQuery from "./components/misc/FlowBundleQuery.js";
import FlowQuery from "./components/misc/FlowQuery.js";
import FlowTypeQuery from "./components/misc/FlowTypeQuery.js";

// charts
import MiniLine from "./components/views/global/content/MiniLine.js";
import Scatter from "./components/views/global/content/Scatter.js";
import PagingBar from "./components/views/global/content/PagingBar.js";

// testing components
import SimpleTable from "./components/chart/table/SimpleTable.js";

//: React.FC
const App = () => {
  // Track whether the component is still loading.
  const [loading, setLoading] = React.useState(true);
  const [funderData, setFunderData] = React.useState([]);
  const [recipientData, setRecipientData] = React.useState([]);
  const [countryFunderData, setCountryFunderData] = React.useState([]);
  const [countryRecipientData, setCountryRecipientData] = React.useState([]);
  const [networkData, setNetworkData] = React.useState([]);
  const [flowTypeInfo, setFlowTypeInfo] = React.useState([]);

  // Try components
  const [detailsComponent, setDetailsComponent] = React.useState(null);

  async function getAppData() {
    const baseQueryParams = {
      focus_node_ids: null,
      focus_node_type: "source",
      // focus_node_category: ["country"],
      flow_type_ids: [1, 2, 3, 4],
      start_date: "2014-01-01",
      end_date: "2019-12-31",
      by_neighbor: false,
      filters: {},
      summaries: {}
    };
    const queries = {
      funderData: await FlowBundleQuery({
        ...baseQueryParams,
        focus_node_type: "source"
      }),
      recipientData: await FlowBundleQuery({
        ...baseQueryParams,
        focus_node_type: "target"
      }),
      countryFunderData: await FlowBundleQuery({
        ...baseQueryParams,
        focus_node_type: "source",
        focus_node_category: ["country"]
      }),
      countryRecipientData: await FlowBundleQuery({
        ...baseQueryParams,
        focus_node_type: "target",
        focus_node_category: ["country"]
      }),
      networkData: await FlowBundleQuery({
        ...baseQueryParams,
        focus_node_type: "source",
        by_neighbor: true,
        focus_node_category: ["country", "group"]
      })
    };

    const results = await Util.getQueryResults(queries);
    console.log("results");
    console.log(results);

    // const testF = await FlowQuery({
    //   focus_node_type: "source",
    //   focus_node_ids: null,
    //   flow_type_ids: [5],
    //   start_date: "2014-01-01",
    //   end_date: "2019-12-31",
    //   return_child_flows: true,
    //   bundle_child_flows: true,
    //   bundle_child_flows_by_neighbor: false,
    //   filters: {}
    // });
    setFunderData(results.funderData);
    setRecipientData(results.recipientData);
    setCountryFunderData(results.countryFunderData);
    setCountryRecipientData(results.countryRecipientData);
    setNetworkData(results.networkData);

    setFlowTypeInfo(
      await FlowTypeQuery({
        flow_type_ids: null
      })
    );

    setLoading(false);
  }

  React.useEffect(() => {
    setLoading(false);
    // console.log("getAppData");
    // getAppData();
  }, []);

  // Define what columns to show in tables
  const valueColsInkind = ["provided_inkind", "committed_inkind"];
  const valueColsFinancial = ["disbursed_funds", "committed_funds"];
  const valueColsAssistance = valueColsInkind.concat(valueColsFinancial);

  /**
   * TODO move this into the simpletable component
   * Return row data for tables of top funders/recipients, and other tables.
   * @method getTableRows
   * @param  {[type]}     valueCols [description]
   * @param  {[type]}     data      [description]
   * @return {[type]}               [description]
   */
  const getTableRows = ({ valueCols, data }) => {
    return data;
    const tableRows = [];
    data.forEach(node => {
      const row = {
        name: node.focus_node_id
      };
      node.flow_bundles.forEach(fb => {
        if (valueCols.includes(fb.flow_type)) {
          row[fb.flow_type] = fb.focus_node_weight;
        }
      });
      tableRows.push(row);
    });
    return tableRows;
  };

  /**
   * TODO at minimum move this into a NetworkMap component that just returns table for now
   * TODO move this data processing to API (selected via "format" argument)
   * TODO find way to nest within regions
   * @method getNetworkFlows
   * @param  {[type]}        valueCols [description]
   * @param  {[type]}        data      [description]
   * @return {[type]}                  [description]
   */
  const getNetworkFlows = ({ data }) => {
    const networkFlows = [];
    data.forEach(d => {
      // Create flow between source and target
      const strict = true;
      if (strict) {
        if (d.source.length > 1) return;
        else if (d.target.length > 1) return;
      }
      const flow = {
        source: d.focus_node_id,
        target: d.target.join(", ")
      };

      // Add flow type values
      for (const [key, val] of Object.entries(d.flow_types)) {
        flow[key] = val.focus_node_weight;
      }
      networkFlows.push(flow);
    });
    return networkFlows;
  };

  const networkFlows = getNetworkFlows({
    data: networkData
  });

  const limit = 50;

  const baseCols = [
    {
      name: "name",
      display_name: "Name"
    }
  ];

  const baseColsNetwork = [
    {
      name: "source",
      display_name: "Funder"
    },
    {
      name: "target",
      display_name: "Recipient"
    }
  ];

  const getColInfo = ({ valueCols, baseCols, flowTypeInfo }) => {
    const valueColInfo = flowTypeInfo.filter(ft => valueCols.includes(ft.name));
    return baseCols.concat(valueColInfo);
  };

  // JSX for main app.
  if (loading) return <div />;
  else
    return (
      <div>
        <BrowserRouter>
          <Nav />
          <Switch>
            <div>
              <Route
                exact
                path="/"
                component={() => {
                  return (
                    <div>
                      <h1>Flows of assistance</h1>
                      <p>
                        <i>
                          where specific funder and recipient are able to be
                          plotted on chord diagram
                        </i>
                      </p>
                      {
                        <SimpleTable
                          colInfo={getColInfo({
                            valueCols: valueColsAssistance,
                            baseCols: baseColsNetwork,
                            flowTypeInfo: flowTypeInfo
                          })}
                          rows={networkFlows}
                          limit={limit}
                        />
                      }
                      <h1>Top {limit} funders (sorted by disbursed funds)</h1>
                      <SimpleTable
                        colInfo={getColInfo({
                          valueCols: valueColsAssistance,
                          baseCols: baseCols,
                          flowTypeInfo: flowTypeInfo
                        })}
                        data={funderData}
                        limit={limit}
                      />
                      <hr />
                      <h1>
                        Top {limit} recipients (sorted by disbursed funds)
                      </h1>
                      <SimpleTable
                        colInfo={getColInfo({
                          valueCols: valueColsAssistance,
                          baseCols: baseCols,
                          flowTypeInfo: flowTypeInfo
                        })}
                        data={recipientData}
                        limit={limit}
                      />
                      <hr />
                      <h1>
                        Top {limit} country funders (sorted by disbursed funds)
                      </h1>
                      <SimpleTable
                        colInfo={getColInfo({
                          valueCols: valueColsAssistance,
                          baseCols: baseCols,
                          flowTypeInfo: flowTypeInfo
                        })}
                        data={countryFunderData}
                        limit={limit}
                      />
                      <hr />
                      <h1>
                        Top {limit} country recipients (sorted by disbursed
                        funds)
                      </h1>
                      <SimpleTable
                        colInfo={getColInfo({
                          valueCols: valueColsAssistance,
                          baseCols: baseCols,
                          flowTypeInfo: flowTypeInfo
                        })}
                        data={countryRecipientData}
                        limit={limit}
                      />
                    </div>
                  );
                }}
              />
              <Route
                exact
                path="/details/:id/:entityRole"
                render={d => {
                  return renderDetails({
                    ...d.match.params,
                    detailsComponent: detailsComponent,
                    setDetailsComponent: setDetailsComponent,
                    loading: loading,
                    setLoading: setLoading,
                    flowTypeInfo: flowTypeInfo
                  });
                }}
              />
            </div>
          </Switch>
        </BrowserRouter>
      </div>
    );
};

export const Settings = {
  startYear: 2014,
  endYear: 2019
};

export default App;
