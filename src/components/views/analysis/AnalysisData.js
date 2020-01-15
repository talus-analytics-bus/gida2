import React from "react";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import { renderAnalysis } from "./Analysis.js";

// FC for AnalysisData.
const AnalysisData = ({
  data,
  ghsaOnly,
  setGhsaOnly,
  flowTypeInfo,
  ...props
}) => {
  // Track min and max year of data (consistent across tabs)
  const [minYear, setMinYear] = React.useState(Settings.startYear);
  const [maxYear, setMaxYear] = React.useState(Settings.endYear);
  const [coreCapacities, setCoreCapacities] = React.useState([]);
  const [component, setComponent] = React.useState(null);

  const content = renderAnalysis({
    component: component,
    setComponent: setComponent,
    flowTypeInfo: flowTypeInfo,
    ghsaOnly: ghsaOnly,
    setGhsaOnly: setGhsaOnly,
    coreCapacities: coreCapacities,
    setCoreCapacities: setCoreCapacities,
    minYear: minYear,
    setMinYear: setMinYear,
    maxYear: maxYear,
    setMaxYear: setMaxYear
  });

  // legend (maybe part of map?)
  return content;
};

export const renderAnalysisData = ({
  component,
  setComponent,
  loading,
  flowTypeInfo,
  ghsaOnly,
  setGhsaOnly,
  ...props
}) => {
  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <AnalysisData
        {...{
          flowTypeInfo,
          ghsaOnly,
          setGhsaOnly
        }}
      />
    );
  }
};

export default AnalysisData;
