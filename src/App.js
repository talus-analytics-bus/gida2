import React, { useState, useEffect } from "react"
import classNames from "classnames"
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom"
import BrowserDetection from "react-browser-detection"

// layout
import Nav from "./components/layout/nav/Nav.js"
import Footer from "./components/layout/footer/Footer.js"

// queries
import { execute, FlowType, Version } from "./components/misc/Queries"

// views
import Home from "./components/views/home/Home.js"
import MapViewer from "./components/views/explore/content/MapViewer/MapViewer.js"
import FundersAndRecipients from "./components/views/explore/content/Orgs/FundersAndRecipients.js"
import { renderEntityTable } from "./components/views/entitytable/EntityTable.js"
import { renderExport } from "./components/views/export/Export.js"
import AnalysisData from "./components/views/analysis/AnalysisData.js"
import Events from "./components/views/events/Events"
import Details from "./components/views/details/Details"
import Background from "./components/views/about/Background.js"
import DataSources from "./components/views/about/DataSources.js"
import Citations from "./components/views/about/Citations.js"
import Submit from "./components/views/about/Submit.js"
import spinnerImg from "./assets/images/spinner.svg"

// styles
import styles from "./App.module.scss"
import "./components/views/details/details.module.scss"
// import "material-design-icons/iconfont/material-icons.css";

// testing components
import SimpleTable from "./components/chart/table/SimpleTable.js"

// Misc
import Modal from "reactjs-popup"

//: FC
const App = () => {
  // Track whether the component is still loading.
  const [loading, setLoading] = useState(true)
  const [flowTypeInfo, setFlowTypeInfo] = useState([])
  const [versionData, setVersionData] = useState([])

  // Try components
  const [detailsComponent, setDetailsComponent] = useState(null)
  const [entityTableComponent, setEntityTableComponent] = useState(null)
  const [entityTableFundType, setEntityTableFundType] = useState("false")
  const [exploreComponent, setExploreComponent] = useState(null)
  const [exportComponent, setExportComponent] = useState(null)
  const [analysisDataComponent, setAnalysisDataComponent] = useState(null)

  // Track data selections
  const [ghsaOnly, setGhsaOnly] = useState("false")
  const [spinnerOn, setSpinnerOn] = useState(false)

  // Track whether styling is dark or light
  const [isDark, setIsDark] = useState(false)
  const waitingFor = []
  const setLoadingSpinnerOn = (
    val,
    get = false,
    id = undefined,
    override = false,
  ) => {
    const el = document.getElementById("loadingSpinner")
    if (el) {
      if (get) {
        return spinnerOn
      } else {
        if (val) {
          setSpinnerOn(true)
          if (id) waitingFor.push(id)
        } else {
          if (id) waitingFor.pop()
          if (waitingFor.length === 0 || override) {
            setSpinnerOn(false)
          }
        }
      }
    } else {
      console.log("No element found")
    }
  }

  async function getData() {
    const queries = {
      flowTypeInfo: FlowType({}),
      versions: Version(),
    }

    const results = await execute({ queries })
    setFlowTypeInfo(results.flowTypeInfo)
    setVersionData(results.versions)
    setLoading(false)
  }

  useEffect(() => {
    getData()
    const envName = process.env.REACT_APP_ENV_NAME
    console.log("[INFO] Environment name: " + envName)
  }, [])

  // Define what columns to show in tables
  const valueColsInkind = ["provided_inkind", "committed_inkind"]
  const valueColsFinancial = ["disbursed_funds", "committed_funds"]

  // Track the current page.
  const [page, setPage] = useState(undefined)

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
  )

  const modalToShow = {
    chrome: () => "",
    firefox: () => "",
    safari: browser => browserModal("Safari"),
    edge: browser => browserModal("Edge"),
    ie: browser => browserModal("Internet Explorer"),
    opera: browser => browserModal("Opera"),
    default: browser => browserModal("an unsupported browser"),
  }

  // JSX for main app.
  if (loading) return <div />
  else
    return (
      <div className={isDark ? "dark" : ""}>
        <BrowserRouter>
          <Nav {...{ isDark, page }} />
          <Switch>
            <div>
              <Route
                exact
                path="/explore/map"
                render={d => {
                  return <Redirect to="/map" />
                }}
              />
              <Route
                exact
                path="/map"
                render={d => {
                  setPage("explore-map")
                  setExploreComponent(null)
                  // Get support type if specified.
                  const urlParams = new URLSearchParams(d.location.search)
                  const supportTypeDefault =
                    urlParams.get("supportType") !== null
                      ? urlParams.get("supportType")
                      : undefined
                  return (
                    <MapViewer
                      {...{
                        ...d.match.params,
                        versionData,
                        component: exploreComponent,
                        setComponent: setExploreComponent,
                        loading: loading,
                        setLoading: setLoading,
                        flowTypeInfo,
                        ghsaOnly: ghsaOnly,
                        setGhsaOnly: setGhsaOnly,
                        isDark: isDark,
                        setIsDark: setIsDark,
                        supportTypeDefault: supportTypeDefault,
                        fundTypeDefault:
                          supportTypeDefault !== undefined ? "" : "false",
                        setLoadingSpinnerOn,
                        setPage,
                      }}
                    />
                  )
                }}
              />
              <Route
                exact
                path="/explore/org"
                render={d => {
                  return <Redirect to="/funders-and-recipients" />
                }}
              />
              <Route
                exact
                path="/funders-and-recipients"
                render={d => {
                  setPage("funders-and-recipients")

                  // Get support type if specified.
                  const urlParams = new URLSearchParams(d.location.search)
                  const supportTypeDefault =
                    d.match.params.activeTab === "map"
                      ? urlParams.get("supportType") !== null
                        ? urlParams.get("supportType")
                        : undefined
                      : undefined

                  return (
                    <FundersAndRecipients
                      {...{
                        ...d.match.params,
                        versionData,
                        component: exploreComponent,
                        setComponent: setExploreComponent,
                        loading: loading,
                        setLoading: setLoading,
                        flowTypeInfo,
                        ghsaOnly: ghsaOnly,
                        setGhsaOnly: setGhsaOnly,
                        isDark: isDark,
                        setIsDark: setIsDark,
                        supportTypeDefault: supportTypeDefault,
                        fundTypeDefault:
                          supportTypeDefault !== undefined ? "" : "false",
                        setLoadingSpinnerOn,
                      }}
                    />
                  )
                }}
              />
              <Route
                exact
                path="/details/:id/:entityRole"
                render={d => {
                  setPage("details")
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
                        setPage,
                      }}
                    />
                  )
                }}
              />
              {
                // <Route
                //   exact
                //   path="/events/:slug"
                //   render={d => {
                //     return (
                //       <Events
                //         {...{
                //           ...d.match.params, // id
                //           flowTypeInfo,
                //         }}
                //       />
                //     );
                //   }}
                // />
              }
              <Route
                exact
                path="/table/:id/:entityRole"
                render={d => {
                  setPage("data")
                  const defaultGhsaOnly =
                    d.match.params.id === "ghsa" ? "false" : entityTableFundType
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
                  })
                }}
              />
              <Route
                exact
                path="/data"
                render={d => {
                  setPage("data")
                  return renderExport({
                    ...d.match.params,
                    component: exportComponent,
                    setComponent: setExportComponent,
                    setLoadingSpinnerOn,
                  })
                }}
              />
              <Route
                exact
                path="/analysis"
                render={d => {
                  setPage("analysis")
                  return (
                    <AnalysisData
                      {...{
                        ...d.match.params,
                        component: analysisDataComponent,
                        setComponent: setAnalysisDataComponent,
                        flowTypeInfo: flowTypeInfo,
                        ghsaOnly: ghsaOnly,
                        setGhsaOnly: setGhsaOnly,
                        setLoadingSpinnerOn,
                      }}
                    />
                  )
                }}
              />
              <Route
                exact
                path="/pair-table/:funderId/:recipientId"
                render={d => {
                  setPage(undefined)
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
                  })
                }}
              />
              <Route
                exact
                path="/details/:id"
                render={d => {
                  if (d.match.params.id === "ghsa") {
                    setPage("ghsa")
                    return (
                      <Details
                        {...{
                          ...d.match.params,
                          detailsComponent: detailsComponent,
                          setDetailsComponent: setDetailsComponent,
                          loading: loading,
                          setLoading: setLoading,
                          flowTypeInfo: flowTypeInfo,
                          entityRole: "funder",
                          setLoadingSpinnerOn,
                        }}
                      />
                    )
                    // return renderDetails({
                    //   ...d.match.params,
                    //   detailsComponent: detailsComponent,
                    //   setDetailsComponent: setDetailsComponent,
                    //   loading: loading,
                    //   setLoading: setLoading,
                    //   flowTypeInfo: flowTypeInfo,
                    //   setLoadingSpinnerOn,
                    // });
                  } else setPage(undefined)
                  return (
                    <Redirect to={`/details/${d.match.params.id}/funder`} />
                  )
                }}
              />
              <Route
                exact
                path="/about/background"
                render={d => {
                  setPage("about")
                  return <Background {...{ setLoadingSpinnerOn }} />
                }}
              />
              <Route
                exact
                path="/about/data"
                render={d => {
                  setPage("about")
                  return <DataSources />
                }}
              />
              <Route
                exact
                path="/about/citations"
                render={d => {
                  setPage("about")
                  return <Citations />
                }}
              />
              <Route
                exact
                path="/about/submit"
                render={d => {
                  setPage("about")
                  return <Submit {...{ setLoadingSpinnerOn }} />
                }}
              />
              <Route
                exact
                path="/"
                render={d => {
                  setPage("home")
                  return <Home />
                }}
              />
            </div>
          </Switch>
          <BrowserDetection>{modalToShow}</BrowserDetection>
        </BrowserRouter>
        {
          <Footer
            {...{ versionData, isDark, isWide: page === "explore-map" }}
          />
        }
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
    )
}

export const Settings = {
  startYear: 2014,
  endYear: 2020,
}

export default App
