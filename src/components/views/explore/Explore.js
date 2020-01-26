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
import { renderOrgs } from "./content/Orgs/Orgs.js";
import GhsaButton from "../../common/GhsaButton/GhsaButton.js";
import { Toggle } from "react-toggle-component";

// FC for Explore.
const Explore = ({
  activeTab,
  data,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  supportTypeDefault,
  setLoadingSpinnerOn,
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
    return undefined;
  };

  // Track tab content components
  const [mapViewerComponent, setMapViewerComponent] = React.useState(null);
  const [orgComponent, setOrgComponent] = React.useState(null);
  const [curComponent, setCurComponent] = React.useState(null);

  // Track entity role selected for the map
  const [entityRole, setEntityRole] = React.useState("recipient");

  // Track min and max year of data (consistent across tabs)
  const [minYear, setMinYear] = React.useState(Settings.startYear);
  const [maxYear, setMaxYear] = React.useState(Settings.endYear);

  // Set value filters
  const [coreCapacities, setCoreCapacities] = React.useState([]);
  const [outbreakResponses, setOutbreakResponses] = React.useState([]);

  // Track whether user...
  const [supportTypeToSwitchTo, setSupportTypeToSwitchTo] = React.useState(
    undefined
  );

  React.useEffect(() => {
    // Set isDark defaults.
    props.setIsDark(activeTab === "map");
  }, [activeTab]);

  React.useEffect(() => {
    // Set isDark defaults.
    return () => {
      props.setIsDark(false);
    };
  }, []);

  // Get header data
  const headerData = getHeaderData(activeTab);

  React.useEffect(() => {
    if (activeTab === "map") {
      renderMapViewer({
        isDark: mapViewerComponent === null || props.isDark,
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
        setMaxYear: setMaxYear,
        supportTypeDefault,
        setLoadingSpinnerOn,
        setSupportTypeToSwitchTo
      });
    } else {
      renderOrgs({
        component: orgComponent,
        setComponent: setOrgComponent,
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
        setMaxYear: setMaxYear,
        setLoadingSpinnerOn
      });
    }
  }, [activeTab, minYear, maxYear, coreCapacities, ghsaOnly, entityRole]);

  React.useEffect(() => {
    if (activeTab === "map" && supportTypeToSwitchTo !== undefined) {
      setSupportTypeToSwitchTo(undefined);
      renderMapViewer({
        isDark: props.isDark,
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
        setMaxYear: setMaxYear,
        supportTypeDefault: supportTypeToSwitchTo,
        setLoadingSpinnerOn
      });
    }
  }, [supportTypeToSwitchTo]);

  React.useEffect(() => {
    if (activeTab === "map" && mapViewerComponent !== null)
      renderMapViewer({
        isDark: props.isDark,
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
        setMaxYear: setMaxYear,
        supportTypeDefault,
        setLoadingSpinnerOn
      });
  }, [props.isDark]);

  // Return JSX
  if (headerData === undefined) return <div />;
  else
    return (
      <div
        className={classNames(
          "pageContainer",
          { wide: activeTab === "map" },
          styles.explore,
          {
            [styles.dark]: props.isDark
          }
        )}
      >
        <div className={styles.header}>
          <div className={styles.title}>{headerData.header}</div>
          <span>{headerData.instructions}</span>
          <div className={styles.controls}>
            <div className={styles.buttons}>
              {activeTab === "map" && (
                <div className={styles.darkToggle}>
                  <Toggle
                    checked={props.isDark}
                    knobColor="#ccc"
                    borderWidth="1px"
                    borderColor="#ccc"
                    radius="3px"
                    knobWidth="8px"
                    backgroundColor={props.isDark ? "#222" : "white"}
                    radiusBackground="2px"
                    knobRadius="2px"
                    width={"55px"}
                    name="toggle-1"
                    onToggle={() => props.setIsDark(!props.isDark)}
                  />
                  <div className={classNames({ [styles.dark]: props.isDark })}>
                    {props.isDark ? `Dark` : "Light"}
                  </div>
                </div>
              )}
              <GhsaButton />
            </div>
          </div>
        </div>
        <div className={styles.content}>
          {activeTab === "map" ? mapViewerComponent : orgComponent}
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
  setLoadingSpinnerOn,
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
        supportTypeDefault={props.supportTypeDefault}
        setLoadingSpinnerOn={setLoadingSpinnerOn}
      />
    );
  }
};

export default Explore;
