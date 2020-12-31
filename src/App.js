import React from "react";
import classNames from "classnames";
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";
import BrowserDetection from "react-browser-detection";

// layout
import Nav from "./components/layout/nav/Nav.js";
import Footer from "./components/layout/footer/Footer.js";

// queries
import { execute, FlowType, Stakeholder } from "./components/misc/Queries";

// views
import Home from "./components/views/home/Home.js";
import { renderExplore } from "./components/views/explore/Explore.js";
import { renderEntityTable } from "./components/views/entitytable/EntityTable.js";
import { renderExport } from "./components/views/export/Export.js";
import { renderAnalysisData } from "./components/views/analysis/AnalysisData.js";
import Details from "./components/views/details/Details";
import Background from "./components/views/about/Background.js";
import DataSources from "./components/views/about/DataSources.js";
import Citations from "./components/views/about/Citations.js";
import Submit from "./components/views/about/Submit.js";
import spinnerImg from "./assets/images/spinner.svg";

// styles
import styles from "./App.module.scss";
import "./components/views/details/details.module.scss";
import "material-design-icons/iconfont/material-icons.css";

// testing components
import SimpleTable from "./components/chart/table/SimpleTable.js";

// Misc
import Modal from "reactjs-popup";

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
  const [entityTableFundType, setEntityTableFundType] = React.useState("false");
  const [exploreComponent, setExploreComponent] = React.useState(null);
  const [exportComponent, setExportComponent] = React.useState(null);
  const [analysisDataComponent, setAnalysisDataComponent] = React.useState(
    null
  );

  // Track data selections
  const [ghsaOnly, setGhsaOnly] = React.useState("false");
  const [spinnerOn, setSpinnerOn] = React.useState(false);

  // Track whether styling is dark or light
  const [isDark, setIsDark] = React.useState(false);
  const loadingSpinnerOn = false;
  const waitingFor = [];
  const setLoadingSpinnerOn = (
    val,
    get = false,
    id = undefined,
    override = false
  ) => {
    const el = document.getElementById("loadingSpinner");
    if (el) {
      if (get) {
        return spinnerOn;
        // return el.classList.contains(styles.on);
      } else {
        if (val) {
          // el.classList.toggle(styles.on, true);
          setSpinnerOn(true);
          if (id) waitingFor.push(id);
        } else {
          if (id) waitingFor.pop();
          if (waitingFor.length === 0 || override) {
            // el.classList.toggle(styles.on, false);
            setSpinnerOn(false);
          }
        }
      }
    } else {
      console.log("No element found");
    }
  };

  async function getAppData() {
    const queries = {
      flowTypeInfo: FlowType({}),
    };

    const results = await execute({ queries });
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
        name: node.focus_node_id,
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
        target: d.target.join(", "),
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
    data: networkData,
  });

  const limit = 50;

  const baseCols = [
    {
      name: "name",
      display_name: "Name",
    },
  ];

  const baseColsNetwork = [
    {
      name: "source",
      display_name: "Funder",
    },
    {
      name: "target",
      display_name: "Recipient",
    },
  ];

  const getColInfo = ({ valueCols, baseCols, flowTypeInfo }) => {
    const valueColInfo = flowTypeInfo.filter(ft => valueCols.includes(ft.name));
    return baseCols.concat(valueColInfo);
  };

  // Track the current page.
  const [page, setPage] = React.useState(undefined);

  // Define a modal to show if an unexpected or unsupported browser is detected
  const browserModal = browser => (
    <Modal
      position="top center"
      on="click"
      closeOnDocumentClick
      defaultOpen={true}
      modal
    >
      {close => (
        <div className={styles.modal}>
          <div className={styles.header}>Please try a different browser</div>
          <div className={styles.content}>
            <div className={styles.text}>
              <p>
                This site was designed for Chrome and Firefox desktop browsers,
                but you seem to be using an unsupported browser.
              </p>
              <p>
                If this is correct, please open this site in Chrome or Firefox
                for desktop instead.
              </p>
            </div>
            <button className={classNames("button", "modal")} onClick={close}>
              Continue
            </button>
          </div>
        </div>
      )}
    </Modal>
  );

  const modalToShow = {
    chrome: () => "",
    firefox: () => "",
    safari: browser => browserModal("Safari"),
    edge: browser => browserModal("Edge"),
    ie: browser => browserModal("Internet Explorer"),
    opera: browser => browserModal("Opera"),
    default: browser => browserModal("an unsupported browser"),
  };

  // JSX for main app.
  if (loading) return <div />;
  else
    return (
      <div className={isDark ? "dark" : ""}>
        <BrowserRouter>
          <Nav {...{ isDark, page }} />
          <Switch>
            <div>
              <Route
                exact
                path="/explore/:activeTab"
                render={d => {
                  setPage("explore-" + d.match.params.activeTab);
                  setExploreComponent(null);
                  // Get support type if specified.
                  const urlParams = new URLSearchParams(d.location.search);
                  const supportTypeDefault =
                    d.match.params.activeTab === "map"
                      ? urlParams.get("supportType") !== null
                        ? urlParams.get("supportType")
                        : undefined
                      : undefined;

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
                    setIsDark: setIsDark,
                    supportTypeDefault: supportTypeDefault,
                    fundTypeDefault:
                      supportTypeDefault !== undefined ? "" : "false",
                    setLoadingSpinnerOn,
                  });
                }}
              />
              <Route
                exact
                path="/details/:id/:entityRole"
                render={d => {
                  return (
                    <Details
                      {...{
                        ...d.match.params,
                        id: parseInt(d.match.params.id),
                        loading: loading,
                        setLoading: setLoading,
                        flowTypeInfo: flowTypeInfo,
                        ghsaOnly: ghsaOnly,
                        setGhsaOnly: setGhsaOnly,
                        setLoadingSpinnerOn,
                      }}
                    />
                  );
                }}
              />
              <Route
                exact
                path="/table/:id/:entityRole"
                render={d => {
                  setPage(undefined);
                  const defaultGhsaOnly =
                    d.match.params.id === "ghsa"
                      ? "false"
                      : entityTableFundType;
                  return renderEntityTable({
                    ...d.match.params,
                    component: entityTableComponent,
                    setComponent: setEntityTableComponent,
                    loading: loading,
                    setLoading: setLoading,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: defaultGhsaOnly,
                    setGhsaOnly: setEntityTableFundType,
                    setLoadingSpinnerOn,
                  });
                }}
              />
              <Route
                exact
                path="/data"
                render={d => {
                  setPage("data");
                  return renderExport({
                    ...d.match.params,
                    component: exportComponent,
                    setComponent: setExportComponent,
                    setLoadingSpinnerOn,
                  });
                }}
              />
              <Route
                exact
                path="/analysis"
                render={d => {
                  setPage("analysis");
                  return renderAnalysisData({
                    ...d.match.params,
                    component: analysisDataComponent,
                    setComponent: setAnalysisDataComponent,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: ghsaOnly,
                    setGhsaOnly: setGhsaOnly,
                    setLoadingSpinnerOn,
                  });
                }}
              />
              <Route
                exact
                path="/pair-table/:funderId/:recipientId"
                render={d => {
                  setPage(undefined);
                  return renderEntityTable({
                    id: parseInt(d.match.params.funderId),
                    otherId: parseInt(d.match.params.recipientId),
                    component: entityTableComponent,
                    setComponent: setEntityTableComponent,
                    loading: loading,
                    setLoading: setLoading,
                    flowTypeInfo: flowTypeInfo,
                    ghsaOnly: entityTableFundType,
                    setGhsaOnly: setEntityTableFundType,
                    setLoadingSpinnerOn,
                  });
                }}
              />
              <Route
                exact
                path="/details/:id"
                render={d => {
                  if (d.match.params.id === "ghsa") {
                    setPage("ghsa");
                    return (
                      <Details
                        {...{
                          ...d.match.params,
                          detailsComponent: detailsComponent,
                          setDetailsComponent: setDetailsComponent,
                          loading: loading,
                          setLoading: setLoading,
                          flowTypeInfo: flowTypeInfo,
                          setLoadingSpinnerOn,
                        }}
                      />
                    );
                    // return renderDetails({
                    //   ...d.match.params,
                    //   detailsComponent: detailsComponent,
                    //   setDetailsComponent: setDetailsComponent,
                    //   loading: loading,
                    //   setLoading: setLoading,
                    //   flowTypeInfo: flowTypeInfo,
                    //   setLoadingSpinnerOn,
                    // });
                  } else setPage(undefined);
                  return (
                    <Redirect to={`/details/${d.match.params.id}/funder`} />
                  );
                }}
              />
              <Route
                exact
                path="/about/background"
                render={d => {
                  setPage("about");
                  return <Background {...{ setLoadingSpinnerOn }} />;
                }}
              />
              <Route
                exact
                path="/about/data"
                render={d => {
                  setPage("about");
                  return <DataSources />;
                }}
              />
              <Route
                exact
                path="/about/citations"
                render={d => {
                  setPage("about");
                  return <Citations />;
                }}
              />
              <Route
                exact
                path="/about/submit"
                render={d => {
                  setPage("about");
                  return <Submit {...{ setLoadingSpinnerOn }} />;
                }}
              />
              <Route
                exact
                path="/"
                render={d => {
                  setPage("home");
                  return <Home />;
                }}
              />
            </div>
          </Switch>
          <BrowserDetection>{modalToShow}</BrowserDetection>
        </BrowserRouter>
        {<Footer {...{ isDark, isWide: page === "explore-map" }} />}
        {
          <div
            id={"loadingSpinner"}
            className={classNames(styles.loadingSpinner, {
              [styles.on]: page !== "home" && page !== "about" && spinnerOn,
            })}
          >
            <img src={spinnerImg} />
            <div>Loading...</div>
          </div>
        }
      </div>
    );
};

export const Settings = {
  startYear: 2014,
  endYear: 2020,
};

export default App;
