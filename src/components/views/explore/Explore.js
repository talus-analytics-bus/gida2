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

  // Set value filters
  const [coreCapacities, setCoreCapacities] = React.useState([]);
  const [outbreakResponses, setOutbreakResponses] = React.useState([]);

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
        coreCapacities: coreCapacities,
        setCoreCapacities: setCoreCapacities,
        outbreakResponses: outbreakResponses,
        setOutbreakResponses: setOutbreakResponses,
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

  // When Explore is mounted, set to dark mode.
  // When Explore is unmounted (we leave the page) return to light mode.
  React.useEffect(() => {
    props.setIsDark(true);
    return () => {
      props.setIsDark(false);
    };
  }, []);

  // Return JSX
  return (
    <div
      className={classNames("pageContainer", styles.explore, {
        [styles.dark]: props.isDark
      })}
    >
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
            <button onClick={() => props.setIsDark(!props.isDark)}>
              {props.isDark ? `Dark` : "Light"}
            </button>
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
        setIsDark={props.setIsDark}
        isDark={props.isDark}
      />
    );
  }
};

export default Explore;
