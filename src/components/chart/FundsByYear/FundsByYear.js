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

// Data functions

// FC
const FundsByYear = ({
  id,
  entityRole,
  data,
  flowTypeInfo,
  unknownDataOnly,
  noFinancialData,
  ...props
}) => {
  // Get area line data
  const areaLineData = [];
  for (let i = Settings.startYear; i <= Settings.endYear; i++) {
    const yearDatum = {
      attribute: i.toString()
    };

    flowTypeInfo.forEach(ft => {
      if (data[ft.name] === undefined) yearDatum[ft.name] = "n/a";
      else {
        const yearDatumVal = data[ft.name].summaries.year[i.toString()];
        if (yearDatumVal !== undefined) yearDatum[ft.name] = yearDatumVal;
        else yearDatum[ft.name] = "n/a";
      }
    });
    areaLineData.push(yearDatum);
  }

  // Get link to entitytable page
  const linkToEntityTable = (
    <Button
      type={"secondary"}
      image={tableIcon}
      label={"View table of funds"}
      linkTo={`/table/${id}/${entityRole}`}
    />
  );
  // const linkToEntityTable = (
  //   <Link to={`/table/${id}/${entityRole}`}>
  //     <button>
  //       <img src={tableIcon} />
  //       View table of funds
  //     </button>
  //   </Link>
  // );
  return (
    <div className={styles.fundsByYear}>
      {!unknownDataOnly && !noFinancialData && (
        <div className={styles.content}>
          <div className={styles.totals}>
            <TotalByFlowType flowType="disbursed_funds" data={data} />
            <TotalByFlowType flowType="committed_funds" data={data} />
            {linkToEntityTable}
          </div>
          <div className={styles.areaLine}>
            <AreaLine
              entityRole={entityRole}
              flowTypeInfo={flowTypeInfo}
              data={areaLineData}
              id={id}
              ghsaOnly={props.ghsaOnly}
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
