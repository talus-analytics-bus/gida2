import React from "react";
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";

// layout
import Nav from "./components/layout/nav/Nav.js";
import Footer from "./components/layout/footer/Footer.js";
import Util from "./components/misc/Util.js";

// views
import Home from "./components/views/home/Home.js";
import { renderExplore } from "./components/views/explore/Explore.js";
import { renderDetails } from "./components/views/details/Details.js";
import { renderEntityTable } from "./components/views/entitytable/EntityTable.js";
import { renderExport } from "./components/views/export/Export.js";
import { renderAnalysisData } from "./components/views/analysis/AnalysisData.js";
import Background from "./components/views/about/Background.js";
import DataSources from "./components/views/about/DataSources.js";
import Research from "./components/views/about/Research.js";
import Submit from "./components/views/about/Submit.js";

// styles
import styles from "./App.module.scss";
import "./components/views/details/details.module.scss";
import "material-design-icons/iconfont/material-icons.css";

// queries
import FlowTypeQuery from "./components/misc/FlowTypeQuery.js";

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
  const [entityTableComponent, setEntityTableComponent] = React.useState(null);
  const [exploreComponent, setExploreComponent] = React.useState(null);
  const [exportComponent, setExportComponent] = React.useState(null);
  const [analysisDataComponent, setAnalysisDataComponent] = React.useState(
    null
  );

  // Track data selections
  const [ghsaOnly, setGhsaOnly] = React.useState("false");

  // Track whether styling is dark or light
  const [isDark, setIsDark] = React.useState(false);

  async function getAppData() {
    const queries = {
      flowTypeInfo: FlowTypeQuery({
        flow_type_ids: null
      })
    };

    const results = await Util.getQueryResults(queries);
    setFlowTypeInfo(results.flowTypeInfo);
    setLoading(false);
  }

  React.useEffect(() => {
    getAppData();
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
      <div className={isDark ? "dark" : ""}>
        <BrowserRouter>
          <Nav />
          <Switch>
            <div>
              <Route
                exact
                path="/explore/:activeTab"
                render={d => {
                  return renderExplore({
                    ...d.match.params,
                    component: exploreComponent,
                    setComponent: setExploreComponent,
                    loading: loading,
                    setLoading: setLoading,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: ghsaOnly,
                    setGhsaOnly: setGhsaOnly,
                    isDark: isDark,
                    // isDark: d.match.params.activeTab === "map",
                    setIsDark: setIsDark
                  });
                }}
              />
              <Route
                exact
                path="/details/:id/:entityRole"
                render={d => {
                  return renderDetails({
                    ...d.match.params,
                    id: parseInt(d.match.params.id),
                    detailsComponent: detailsComponent,
                    setDetailsComponent: setDetailsComponent,
                    loading: loading,
                    setLoading: setLoading,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: ghsaOnly,
                    setGhsaOnly: setGhsaOnly
                  });
                }}
              />
              <Route
                exact
                path="/table/:id/:entityRole"
                render={d => {
                  return renderEntityTable({
                    ...d.match.params,
                    component: entityTableComponent,
                    setComponent: setEntityTableComponent,
                    loading: loading,
                    setLoading: setLoading,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: ghsaOnly,
                    setGhsaOnly: setGhsaOnly
                  });
                }}
              />
              <Route
                exact
                path="/data"
                render={d => {
                  return renderExport({
                    ...d.match.params,
                    component: exportComponent,
                    setComponent: setExportComponent
                  });
                }}
              />
              <Route
                exact
                path="/analysis"
                render={d => {
                  return renderAnalysisData({
                    ...d.match.params,
                    component: analysisDataComponent,
                    setComponent: setAnalysisDataComponent,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: ghsaOnly,
                    setGhsaOnly: setGhsaOnly
                  });
                }}
              />
              <Route
                exact
                path="/pair-table/:funderId/:recipientId"
                render={d => {
                  return renderEntityTable({
                    id: parseInt(d.match.params.funderId),
                    otherId: parseInt(d.match.params.recipientId),
                    component: entityTableComponent,
                    setComponent: setEntityTableComponent,
                    loading: loading,
                    setLoading: setLoading,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: ghsaOnly,
                    setGhsaOnly: setGhsaOnly
                  });
                }}
              />
              <Route
                exact
                path="/details/:id"
                render={d => {
                  if (d.match.params.id === "ghsa")
                    return renderDetails({
                      ...d.match.params,
                      detailsComponent: detailsComponent,
                      setDetailsComponent: setDetailsComponent,
                      loading: loading,
                      setLoading: setLoading,
                      flowTypeInfo: flowTypeInfo
                    });
                  else
                    return (
                      <Redirect to={`/details/${d.match.params.id}/funder`} />
                    );
                }}
              />
              <Route
                exact
                path="/about/background"
                render={d => <Background />}
              />
              <Route exact path="/about/data" render={d => <DataSources />} />
              <Route exact path="/about/research" render={d => <Research />} />
              <Route exact path="/about/submit" render={d => <Submit />} />
              <Route exact path="/" render={d => <Home />} />
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
