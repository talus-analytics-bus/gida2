import React, { useState, useEffect } from "react";
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
import { execute, NodeSums } from "../../misc/Queries";

// Data functions
// FC
const FundsByYear = ({
  id,
  entityRole,
  flowTypeInfo,
  unknownDataOnly,
  noFinancialData,
  params,
  setLoadingSpinnerOn,
  ...props
}) => {
  // STATE //
  const [data, setData] = useState(null);
  const direction = entityRole === "funder" ? "origin" : "target";
  const updateData = async () => {
    const queries = {
      byYear: NodeSums({
        format: "line_chart",
        direction, // "target"
        group_by: "Flow.year",
        filters: {
          // ...commonFilters,
          "Stakeholder.id": [id],
          "Flow.flow_type": ["disbursed_funds", "committed_funds"],
          "Flow.year": [
            ["gt_eq", Settings.startYear],
            ["lt_eq", Settings.endYear],
          ],
        },
      }),
    };
    const results = await execute({ queries });
    setData(results.byYear);
    if (!initialized) setInitialized(true);
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
  const [fundType, setFundType] = useState("false"); // all

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      updateData();
      return;
    } else if (!unknownDataOnly && !noFinancialData) {
      setLoadingSpinnerOn(true, false, "AreaLine");
      updateData();
      // // Get new data
      // const queryFunc = NodeSums;
      //
      // // update params as needed
      // // TODO update to match new API
      // const filters = {
      //   "Stakeholder.id": [id],
      //   "Flow.flow_type": ["disbursed_funds", "committed_funds"],
      //   "Flow.year": [
      //     ["gt_eq", Settings.startYear],
      //     ["lt_eq", Settings.endYear],
      //   ],
      // };
      // if (fundType === "true") {
      //   filters["Flow.is_ghsa"] = [true];
      // } else if (fundType === "event") {
      //   filters["Flow.response_or_capacity"] = ["response"];
      // } else if (fundType === "capacity") {
      //   filters["Flow.response_or_capacity"] = ["capacity"];
      // }
      // if (id === "ghsa") {
      //   if (fundType !== "true") filters["Flow.is_ghsa"] = [true];
      // }
      // const query = queryFunc({
      //   direction,
      //   group_by: "Flow.year",
      //   filters,
      // });
      // query.then(d => {
      //   const dValues = Object.values(d);
      //   setChartData(dValues);
      //   setAreaLineData(getAreaLineData(dValues));
      // });
    } else {
      setLoadingSpinnerOn(false);
    }
  }, [id, entityRole, fundType]);

  return (
    <div className={styles.fundsByYear}>
      {data !== null && !unknownDataOnly && !noFinancialData && (
        <div className={styles.content}>
          <div className={styles.totals}>
            <GhsaToggle
              {...{
                label: "Show funding type",
                setGhsaOnly: setFundType,
                ghsaOnly: fundType,
                selectpicker: true,
              }}
            />
            <TotalByFlowType flowType="disbursed_funds" data={data.totals} />
            <TotalByFlowType flowType="committed_funds" data={data.totals} />
            {linkToEntityTable}
          </div>
          <div className={styles.areaLine}>
            <AreaLine
              entityRole={entityRole}
              flowTypeInfo={flowTypeInfo}
              data={data.lines}
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
