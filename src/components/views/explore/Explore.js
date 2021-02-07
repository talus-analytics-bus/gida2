import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./explore.module.scss";
import classNames from "classnames";

// Content components
import GhsaToggle from "../../misc/GhsaToggle.js";
import Loading from "../../common/Loading/Loading";
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
  versionData,
  ...props
}) => {
  // Track tab content components
  const [mapViewerComponent, setMapViewerComponent] = useState(null);
  const [orgComponent, setOrgComponent] = useState(null);
  const [curComponent, setCurComponent] = useState(null);
  const [loadedMapOnce, setLoadedMapOnce] = useState(false);
  if (loadedMapOnce) supportTypeDefault = undefined;

  // Track whether components are loaded or not
  const [loaded, setLoaded] = useState(false);
  const [tabInitialized, setTabInitialized] = useState(false);

  // Track entity role selected for the map
  const [entityRole, setEntityRole] = useState("recipient");
  // const [entityRole, setEntityRole] = useState("funder");

  // Track min and max year of data (consistent across tabs)
  const [minYear, setMinYear] = useState(Settings.startYear);
  const [maxYear, setMaxYear] = useState(Settings.endYear);

  // Set value filters
  const [coreCapacities, setCoreCapacities] = useState([]);
  const [outbreakResponses, setOutbreakResponses] = useState([]);

  // Track whether user...
  const [supportTypeToSwitchTo, setSupportTypeToSwitchTo] = useState(undefined);

  // Track funding type
  const [fundType, setFundType] = useState(
    props.fundTypeDefault !== undefined ? props.fundTypeDefault : "false"
  ); // default "all"

  useEffect(() => {
    if (fundType === "event" && coreCapacities.length > 0)
      setCoreCapacities([]);
    else if (fundType !== "event" && outbreakResponses.length > 0)
      setOutbreakResponses([]);
  }, [fundType]);

  useEffect(() => {
    // show correct map header label based on default support type
    const main =
      supportTypeDefault !== undefined && supportTypeDefault === "jee"
        ? "JEE score by country"
        : "Recipients by country";
    setPageHeaderData({
      main: null,
      instructions: "Loading map",
    });
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
    setLoaded(false);
    setTabInitialized(false);
    setCoreCapacities([]);
    setOutbreakResponses([]);

    setMapViewerComponent(null);
    setOrgComponent(null);
    if (activeTab === "map") {
      renderMapViewer({
        ...mapProps,
        versionData,
        coreCapacities: [],
        events: [],
        isDark: true,
        fundType:
          props.fundTypeDefault !== undefined ? props.fundTypeDefault : "false",
        loaded,
        setLoaded,
      });
      if (!loadedMapOnce) setLoadedMapOnce(true);
    } else {
      // Set page header data
      setPageHeaderData({
        main: "Organization funders and recipients",
        instructions: "Choose organization in table to view details.",
      });

      // Render component
      renderOrgs({
        ...orgProps,
        coreCapacities: [],
        events: [],
        ghsaOnly: "false",
      });
    }
  }, [activeTab]);

  // when data loaded, set tab to initialized if not already
  useEffect(() => {
    if (loaded && !tabInitialized) setTabInitialized(true);
  }, [loaded]);

  useEffect(() => {
    // Set isDark defaults.
    return () => {
      props.setIsDark(false);
    };
  }, []);

  // Get header data
  const [pageHeaderData, setPageHeaderData] = useState({});

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
    setSupportTypeToSwitchTo,
    loaded,
    setLoaded,
    versionData,
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
    loaded,
    setLoaded,
  };

  useEffect(() => {
    if (fundType === "event" && coreCapacities.length > 0) return;
    if (fundType !== "event" && outbreakResponses.length > 0) return;
    if (activeTab === "map" && mapViewerComponent !== null) {
      renderMapViewer({
        ...mapProps,
        isDark: mapViewerComponent === null || props.isDark,
        supportTypeDefault:
          supportTypeToSwitchTo !== undefined
            ? supportTypeToSwitchTo
            : supportTypeDefault,
        loaded,
        setLoaded,
      });
      if (supportTypeToSwitchTo !== undefined)
        setSupportTypeToSwitchTo(undefined);
    } else if (activeTab !== "map" && orgComponent !== null) {
      renderOrgs({
        ...orgProps,
      });
    }
  }, [
    minYear,
    maxYear,
    coreCapacities,
    outbreakResponses,
    fundType,
    entityRole,
  ]);

  useEffect(() => {
    if (activeTab === "map" && mapViewerComponent !== null)
      renderMapViewer({
        isDark: props.isDark,
        loaded,
        setLoaded,
        ...mapProps,
      });
  }, [props.isDark]);

  // is loading spinner shown?
  const spinnerDone = loaded || !tabInitialized;
  const initialSpinnerDone = loaded || tabInitialized;
  const loadingInstructions =
    activeTab === "map" ? "Loading map" : "Loading tables";

  // Return JSX
  return (
    <div
      className={classNames(
        "pageContainer",
        { wide: activeTab === "map" },
        styles.explore,
        {
          [styles.dark]: props.isDark,
          [styles[activeTab]]: true,
        }
      )}
    >
      <div className={styles.header}>
        <div className={styles.titles}>
          {(tabInitialized || activeTab !== "map") && (
            <div className={styles.left}>
              {<div className={styles.title}>{pageHeaderData.main}</div>}
              <span>{pageHeaderData.subtitle}</span>
            </div>
          )}
          <div className={styles.right}>
            <Loading {...{ small: true, loaded: spinnerDone }} />
          </div>
        </div>
        <div
          className={classNames(styles.controls, {
            [styles.loading]: !initialSpinnerDone,
          })}
        >
          <span className={styles.instructions}>
            {initialSpinnerDone ? (
              <i>{pageHeaderData.instructions}</i>
            ) : (
              <i>{loadingInstructions}</i>
            )}
          </span>
          <div className={styles.buttons}>
            {pageHeaderData.entityRoleToggle}
            {activeTab === "map" && (
              <div
                className={classNames(styles.darkToggle, {
                  [styles.shown]: tabInitialized,
                })}
              >
                <Toggle
                  checked={props.isDark}
                  knobColor="#ccc"
                  borderWidth="1px"
                  borderColor="#ccc"
                  radius="3px"
                  knobWidth="8px"
                  backgroundColor={props.isDark ? "#333" : "white"}
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
      {
        // primary loading spinner for page initialization
        <Loading {...{ loaded: initialSpinnerDone, align: "center" }}>
          <div
            className={classNames(styles.content, {
              [styles.dark]: props.isDark,
            })}
          >
            {activeTab === "map" ? mapViewerComponent : orgComponent}
          </div>
        </Loading>
      }
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
  versionData,
  ...props
}) => {
  if (loading) {
    return <div className={"placeholder"} />;
  } else {
    return (
      <Explore
        flowTypeInfo={flowTypeInfo}
        versionData={versionData}
        fundType={fundType}
        setFundType={setFundType}
        setComponent={setComponent}
        activeTab={props.activeTab}
        setIsDark={props.setIsDark}
        isDark={props.isDark}
        supportTypeDefault={props.supportTypeDefault}
        fundTypeDefault={props.fundTypeDefault}
      />
    );
  }
};

export default Explore;
