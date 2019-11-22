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
import Details from "./components/views/details/Details.js";
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

// charts
import MiniLine from "./components/views/global/content/MiniLine.js";
import Scatter from "./components/views/global/content/Scatter.js";
import PagingBar from "./components/views/global/content/PagingBar.js";

// testing components
import TopTable from "./components/chart/table/TopTable.js";

//: React.FC
const App = () => {
  // Track whether the component is still loading.
  const [loading, setLoading] = React.useState(true);
  const [topTableData, setTopTableData] = React.useState([]);

  async function getAppData() {
    // TEST: Get top funders list
    const testFb = await FlowBundleQuery({
      focus_node_type: "target",
      focus_node_ids: null,
      // focus_node_category: ["country"],
      flow_type_ids: [1, 2],
      start_date: "2014-01-01",
      end_date: "2019-12-31",
      by_neighbor: false,
      filters: {},
      summaries: {}
    });
    const testF = await FlowQuery({
      focus_node_type: "source",
      focus_node_ids: null,
      flow_type_ids: [5],
      start_date: "2014-01-01",
      end_date: "2019-12-31",
      return_child_flows: true,
      bundle_child_flows: true,
      bundle_child_flows_by_neighbor: false,
      filters: {}
    });
    console.log("testFb");
    console.log(testFb);
    setTopTableData(testFb);

    console.log("testF");
    console.log(testF);
    setLoading(false);
  }

  React.useEffect(() => {
    getAppData();
  }, []);

  const testColNames = ["Name", "Disbursed", "Committed"];
  const valueCols = ["disbursed_funds", "committed_funds"];

  const tableRows = [];
  topTableData.forEach(node => {
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

  console.log("tableRows");
  console.log(tableRows);

  // JSX for main app.
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
                return <TopTable colNames={testColNames} rows={tableRows} />;
              }}
            />
          </div>
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
