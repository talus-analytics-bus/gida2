import React from "react";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import Analysis, { renderAnalysis } from "./Analysis.js";

// FC for AnalysisData.
const AnalysisData = ({
  data,
  ghsaOnly,
  setGhsaOnly,
  flowTypeInfo,
  setLoadingSpinnerOn,
  ...props
}) => {
  // Track min and max year of data (consistent across tabs)
  const [minYear, setMinYear] = React.useState(Settings.startYear);
  const [maxYear, setMaxYear] = React.useState(Settings.endYear);
  const [coreCapacities, setCoreCapacities] = React.useState([]);

  return (
    <Analysis
      {...{
        // component: component,
        // setComponent: setComponent,
        flowTypeInfo: flowTypeInfo,
        ghsaOnly: ghsaOnly,
        setGhsaOnly: setGhsaOnly,
        coreCapacities: coreCapacities,
        setCoreCapacities: setCoreCapacities,
        minYear: minYear,
        setMinYear: setMinYear,
        maxYear: maxYear,
        setMaxYear: setMaxYear,
        setLoadingSpinnerOn,
      }}
    />
  );

  // const [component, setComponent] = React.useState(null);
  //
  // React.useEffect(() => {
  //   renderAnalysis({
  //     component: component,
  //     setComponent: setComponent,
  //     flowTypeInfo: flowTypeInfo,
  //     ghsaOnly: ghsaOnly,
  //     setGhsaOnly: setGhsaOnly,
  //     coreCapacities: coreCapacities,
  //     setCoreCapacities: setCoreCapacities,
  //     minYear: minYear,
  //     setMinYear: setMinYear,
  //     maxYear: maxYear,
  //     setMaxYear: setMaxYear,
  //     setLoadingSpinnerOn
  //   });
  // }, [minYear, maxYear, coreCapacities, ghsaOnly]);
  //
  // if (component === null) return <div className={"placeholder"} />;
  // else return component;
};

export default AnalysisData;
