import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./fundsbyyear.module.scss";

// Infographic components
import TotalByFlowType from "../../infographic/TotalByFlowType/TotalByFlowType.js";
import AreaLine from "../AreaLine/AreaLine.js";
import { Settings } from "../../../App.js";
import tableIcon from "../../../assets/images/table-funds.svg";
import Button from "../../common/Button/Button.js";
import GhsaToggle from "../../misc/GhsaToggle.js";
import FlowBundleFocusQuery from "../../misc/FlowBundleFocusQuery.js";
import FlowBundleGeneralQuery from "../../misc/FlowBundleGeneralQuery.js";

// Data functions
// FC
const FundsByYear = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  unknownDataOnly,
  noFinancialData,
  params,
  setLoadingSpinnerOn,
  ...props
}) => {
  // Get area line data
  const getAreaLineData = data => {
    const areaLineData = [];
    for (let i = Settings.startYear; i <= Settings.endYear; i++) {
      const yearDatum = {
        attribute: i.toString()
      };

      flowTypeInfo.forEach(ft => {
        if (data[ft.name] === undefined) {
          yearDatum[ft.name] = "n/a";
        } else if (ft.flow_type_id > 2) {
          return;
        } else {
          const yearDatumVal = data[ft.name].summaries.year[i.toString()];
          if (yearDatumVal !== undefined) yearDatum[ft.name] = yearDatumVal;
          else yearDatum[ft.name] = "n/a";
        }
      });
      areaLineData.push(yearDatum);
    }
    return areaLineData;
  };

  // Get link to entitytable page
  const linkToEntityTable = (
    <Button
      type={"secondary"}
      image={tableIcon}
      label={"View table of funds"}
      linkTo={`/table/${id}/${entityRole}`}
    />
  );

  // If data type toggle changes, update the data (but not initially, to avoid
  // unnecessary API calls).
  const [fundType, setFundType] = React.useState("false"); // all
  const [chartData, setChartData] = React.useState(data);
  const [areaLineData, setAreaLineData] = React.useState(
    getAreaLineData(chartData)
  );
  const [initialized, setInitialized] = React.useState(false);
  React.useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    } else if (!unknownDataOnly && !noFinancialData) {
      setLoadingSpinnerOn(true, false, "AreaLine");
      // Get new data
      const queryFunc = FlowBundleFocusQuery;
      // const queryFunc =
      //   id === "ghsa" ? FlowBundleGeneralQuery : FlowBundleFocusQuery;

      // update params as needed
      const updatedParams = {
        filters: { parent_flow_info_filters: [] },
        summaries: { flow_info_summary: ["year"] }
        // focus_node_type: "target",
        // focus_node_ids: null
      };
      if (fundType === "true") {
        updatedParams.filters.parent_flow_info_filters.push([
          "ghsa_funding",
          "True"
        ]);
      } else if (fundType === "event") {
        updatedParams.filters.parent_flow_info_filters.push([
          "outbreak_id:not",
          null
        ]);
      } else if (fundType === "capacity") {
        updatedParams.filters.parent_flow_info_filters.push([
          "response_or_capacity:not",
          "response"
        ]);
      }
      if (id === "ghsa") {
        if (fundType !== "true")
          updatedParams.filters.parent_flow_info_filters.push([
            "ghsa_funding",
            "True"
          ]);
      }
      const query = queryFunc({
        ...params,
        ...updatedParams
      });
      query.then(d => {
        setChartData(d.master_summary.flow_types);
        setAreaLineData(getAreaLineData(d.master_summary.flow_types));
      });
    } else {
      setLoadingSpinnerOn(false);
    }
  }, [id, entityRole, fundType]);

  return (
    <div className={styles.fundsByYear}>
      {!unknownDataOnly && !noFinancialData && (
        <div className={styles.content}>
          <div className={styles.totals}>
            <GhsaToggle
              {...{
                label: "Show funding type",
                setGhsaOnly: setFundType,
                ghsaOnly: fundType,
                selectpicker: true
              }}
            />
            <TotalByFlowType flowType="disbursed_funds" data={chartData} />
            <TotalByFlowType flowType="committed_funds" data={chartData} />
            {linkToEntityTable}
          </div>
          <div className={styles.areaLine}>
            <AreaLine
              entityRole={entityRole}
              flowTypeInfo={flowTypeInfo}
              data={areaLineData}
              id={id}
              ghsaOnly={props.ghsaOnly}
              setLoadingSpinnerOn={setLoadingSpinnerOn}
            />
          </div>
        </div>
      )}
      {(unknownDataOnly || noFinancialData) && (
        <div className={styles.content}>
          <div className={classNames(styles.totals, styles.unknownOnly)}>
            <div>
              No funding with specific amounts to show. Click "View table of
              funds" to view all available data.
            </div>
            {linkToEntityTable}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsByYear;
