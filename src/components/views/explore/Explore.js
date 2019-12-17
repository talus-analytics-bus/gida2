import React from "react";
import { Link } from "react-router-dom";
import styles from "./explore.module.scss";
import classNames from "classnames";

// Content components
import GhsaToggle from "../../misc/GhsaToggle.js";
import EntityRoleToggle from "../../misc/EntityRoleToggle.js";
import { Settings } from "../../../App.js";
import Tab from "../../misc/Tab.js";
import { renderMapViewer } from "./content/MapViewer/MapViewer.js";

// FC for Explore.
const Explore = ({
  activeTab,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
  // Returns correct header content given the active tab
  const getHeaderData = tab => {
    if (tab === "org") {
      return {
        header: "EXPLORE ORGANIZATION FUNDERS AND RECIPIENTS",
        instructions: "Choose organization in table to view details."
      };
    } else if (tab === "map") {
      return {
        header: "EXPLORE COUNTRIES ON A MAP",
        instructions: "Choose country on map to view details."
      };
    }
  };

  // Track tab content components
  const [mapViewerComponent, setMapViewerComponent] = React.useState(null);

  // Track entity role selected for the map
  const [entityRole, setEntityRole] = React.useState("recipient");

  // Track min and max year of data (consistent across tabs)
  const [minYear, setMinYear] = React.useState(Settings.startYear);
  const [maxYear, setMaxYear] = React.useState(Settings.endYear);

  // Define content tabs
  const sections = [
    {
      header: "Countries",
      slug: "map",
      content: renderMapViewer({
        component: mapViewerComponent,
        setComponent: setMapViewerComponent,
        entityRole: entityRole,
        setEntityRole: setEntityRole,
        flowTypeInfo: flowTypeInfo,
        ghsaOnly: ghsaOnly,
        setGhsaOnly: setGhsaOnly,
        minYear: minYear,
        setMinYear: setMinYear,
        maxYear: maxYear,
        setMaxYear: setMaxYear
      })
    },
    {
      header: "Organizations",
      slug: "org",
      content: <div>Organization placeholder</div>
    }
  ];

  // Track current tab
  const [curTab, setCurTab] = React.useState(activeTab || sections[0].slug);

  // Get header data
  const headerData = getHeaderData(curTab);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.explore)}>
      <div className={styles.header}>
        <h1>{headerData.header}</h1>
        <span>{headerData.instructions}</span>
        <div className={styles.controls}>
          <div className={styles.tabs}>
            {sections.map(s => (
              <button onClick={() => setCurTab(s.slug)}>{s.header}</button>
            ))}
          </div>
          <div className={styles.buttons}>
            <Link to={"/details/ghsa"}>
              <button>GHSA project details</button>
            </Link>
            <button>Dark</button>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        {sections.map(s => (
          <Tab selected={curTab === s.slug} content={s.content} />
        ))}
      </div>
    </div>
  );
};

export const renderExplore = ({
  component,
  setComponent,
  loading,
  id,
  entityRole,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <Explore
        flowTypeInfo={flowTypeInfo}
        ghsaOnly={ghsaOnly}
        setGhsaOnly={setGhsaOnly}
        setComponent={setComponent}
        activeTab={props.activeTab}
      />
    );
  }
};

// export const renderExplore = ({
//   component,
//   setComponent,
//   loading,
//   id,
//   entityRole,
//   flowTypeInfo,
//   ghsaOnly,
//   setGhsaOnly,
//   ...props
// }) => {
//   if (loading) {
//     return <div>Loading...</div>;
//   } else if (
//     component === null ||
//     (component &&
//       (component.props.id !== id ||
//         component.props.entityRole !== entityRole ||
//         component.props.ghsaOnly !== ghsaOnly))
//   ) {
//     getComponentData({
//       setComponent: setComponent,
//       id: id,
//       entityRole: entityRole,
//       flowTypeInfo: flowTypeInfo,
//       ghsaOnly: ghsaOnly,
//       setGhsaOnly: setGhsaOnly,
//       ...props
//     });
//
//     return component ? component : <div />;
//   } else {
//     return component;
//   }
// };
//
// /**
//  * Returns data for the details page given the entity type and id.
//  * TODO make this work for response funding page
//  * @method getComponentData
//  * @param  {[type]}       setComponent [description]
//  * @param  {[type]}       id                  [description]
//  * @param  {[type]}       entityRole          [description]
//  */
// const getComponentData = async ({
//   setComponent,
//   id,
//   entityRole,
//   flowTypeInfo,
//   ghsaOnly,
//   setGhsaOnly,
//   ...props
// }) => {
//   // Define typical base query parameters used in FlowQuery,
//   // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
//   // modified in code below.
//   const nodeType = entityRole === "recipient" ? "target" : "source";
//   const baseQueryParams = {
//     focus_node_ids: null,
//     focus_node_type: nodeType,
//     flow_type_ids: [1, 2, 3, 4],
//     start_date: `${Settings.startYear}-01-01`, // TODO check these two
//     end_date: `${Settings.endYear}-12-31`,
//     by_neighbor: false,
//     filters: {},
//     summaries: {},
//     include_master_summary: false
//   };
//
//   // If GHSA page, then filter by GHSA projects.
//   if (id === "ghsa" || ghsaOnly === "true")
//     baseQueryParams.filters.parent_flow_info_filters = [
//       ["ghsa_funding", "true"]
//     ];
//
//   // Define queries for typical details page.
//   const queries = {
//     // Information about the entity
//     flowBundlesMap: await FlowBundleFocusQuery({
//       ...baseQueryParams,
//       node_category: ["country"]
//     }),
//     flowBundlesOrg: await FlowBundleFocusQuery({
//       ...baseQueryParams,
//       node_category: ["group"]
//     })
//   };
//
//   // Get query results.
//   const results = await Util.getQueryResults(queries);
//   console.log("results - Explore.js");
//   console.log(results);
//
//   // Feed results and other data to the details component and mount it.
//   setComponent(
//     <Explore
//       id={id}
//       entityRole={entityRole}
//       data={results}
//       flowTypeInfo={flowTypeInfo}
//       ghsaOnly={ghsaOnly}
//       setGhsaOnly={setGhsaOnly}
//       setComponent={setComponent}
//       activeTab={props.activeTab}
//     />
//   );
// };

export default Explore;
