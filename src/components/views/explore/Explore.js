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
import { Toggle } from "react-toggle-component";

// FC for Explore.
const Explore = ({
  activeTab,
  data,
  flowTypeInfo,
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
  // Track funding type
  const [fundType, setFundType] = React.useState(
    props.fundTypeDefault !== undefined ? props.fundTypeDefault : "false"
  ); // default "all"

  React.useEffect(() => {
    if (fundType === "event" && coreCapacities.length > 0)
      setCoreCapacities([]);
    else if (fundType !== "event" && outbreakResponses.length > 0)
      setOutbreakResponses([]);
  }, [fundType]);

  React.useEffect(() => {
    // Set isDark defaults.
    props.setIsDark(activeTab === "map");

    // Skip fund type reset if both components are already null (first loading)
    if (activeTab !== "map") {
      setFundType("false");
    } else {
      setFundType(
        props.fundTypeDefault !== undefined ? props.fundTypeDefault : "false"
      );
    }

    // Get rid of fund type default
    setCoreCapacities([]);
    setOutbreakResponses([]);

    setMapViewerComponent(null);
    setOrgComponent(null);
    if (activeTab === "map") {
      renderMapViewer({
        ...mapProps,
        coreCapacities: [],
        events: [],
        isDark: true,
        fundType:
          props.fundTypeDefault !== undefined ? props.fundTypeDefault : "false"
      });
    } else {
      // Set page header data
      setPageHeaderData({
        header: "ORGANIZATION FUNDERS AND RECIPIENTS",
        instructions: "Choose organization in table to view details."
      });

      // Render component
      renderOrgs({
        ...orgProps,
        coreCapacities: [],
        events: [],
        ghsaOnly: "false"
      });
    }
  }, [activeTab]);

  React.useEffect(() => {
    // Set isDark defaults.
    return () => {
      props.setIsDark(false);
    };
  }, []);

  // Get header data
  const headerData = getHeaderData(activeTab);
  const [pageHeaderData, setPageHeaderData] = React.useState({});

  const mapProps = {
    component: mapViewerComponent,
    setComponent: setMapViewerComponent,
    entityRole: entityRole,
    setEntityRole: setEntityRole,
    flowTypeInfo: flowTypeInfo,
    fundType: fundType,
    setFundType: setFundType,
    coreCapacities: coreCapacities,
    setCoreCapacities: setCoreCapacities,
    events: outbreakResponses,
    setEvents: setOutbreakResponses,
    minYear: minYear,
    setMinYear: setMinYear,
    maxYear: maxYear,
    setMaxYear: setMaxYear,
    setPageHeaderData,
    supportTypeDefault,
    setLoadingSpinnerOn,
    setSupportTypeToSwitchTo
  };

  const orgProps = {
    component: orgComponent,
    setComponent: setOrgComponent,
    entityRole: entityRole,
    setEntityRole: setEntityRole,
    flowTypeInfo: flowTypeInfo,
    ghsaOnly: fundType,
    setGhsaOnly: setFundType,
    coreCapacities: coreCapacities,
    setCoreCapacities: setCoreCapacities,
    events: outbreakResponses,
    setEvents: setOutbreakResponses,
    minYear: minYear,
    setMinYear: setMinYear,
    maxYear: maxYear,
    setMaxYear: setMaxYear,
    setPageHeaderData,
    setLoadingSpinnerOn
  };

  React.useEffect(() => {
    if (fundType === "event" && coreCapacities.length > 0) return;
    if (fundType !== "event" && outbreakResponses.length > 0) return;
    if (activeTab === "map") {
      renderMapViewer({
        ...mapProps,
        isDark: mapViewerComponent === null || props.isDark,
        supportTypeDefault:
          supportTypeToSwitchTo !== undefined
            ? supportTypeToSwitchTo
            : supportTypeDefault
      });
      if (supportTypeToSwitchTo !== undefined)
        setSupportTypeToSwitchTo(undefined);
    } else {
      renderOrgs({
        ...orgProps
      });
    }
  }, [
    minYear,
    maxYear,
    coreCapacities,
    outbreakResponses,
    fundType,
    entityRole
  ]);

  React.useEffect(() => {
    if (activeTab === "map" && mapViewerComponent !== null)
      renderMapViewer({
        isDark: props.isDark,
        ...mapProps
      });
  }, [props.isDark]);

  // Return JSX
  if (headerData === undefined) return <div className={"placeholder"} />;
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
          <div className={styles.titles}>
            <div className={styles.title}>{pageHeaderData.main}</div>
            <span>{pageHeaderData.subtitle}</span>
          </div>
          <div className={styles.controls}>
            <div className={styles.buttons}>
              {pageHeaderData.entityRoleToggle}
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
  fundType,
  setFundType,
  setLoadingSpinnerOn,
  ...props
}) => {
  if (loading) {
    return <div className={"placeholder"} />;
  } else {
    return (
      <Explore
        flowTypeInfo={flowTypeInfo}
        fundType={fundType}
        setFundType={setFundType}
        setComponent={setComponent}
        activeTab={props.activeTab}
        setIsDark={props.setIsDark}
        isDark={props.isDark}
        supportTypeDefault={props.supportTypeDefault}
        setLoadingSpinnerOn={setLoadingSpinnerOn}
        fundTypeDefault={props.fundTypeDefault}
      />
    );
  }
};

export default Explore;
