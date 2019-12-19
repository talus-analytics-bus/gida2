import React from "react";
import { Link } from "react-router-dom";
import styles from "./infobox.module.scss";
import classNames from "classnames";
import Util from "../misc/Util.js";

/**
 * Create the info box to show details about selected map country.
 * @method InfoBox
 */
const InfoBox = ({
  nodeData,
  supportType,
  color,
  entityRole = "funder", // For link button to details page
  infoBoxData = null,
  ...props
}) => {
  console.log("infoBoxData");
  console.log(infoBoxData);
  // Track whether info box is visible or not
  const [show, setShow] = React.useState(true);

  const flowValuesKnown = infoBoxData.unknownValueExplanation === undefined;
  return (
    <div className={classNames(styles.infoBox, { [styles.show]: show })}>
      <div className={styles.header}>
        <div className={styles.name}>{nodeData.name}</div>
        <div className={styles.close}>
          <button onClick={() => setShow(false)}>Close</button>
        </div>
      </div>
      <div className={styles.content}>
        {infoBoxData.jeeLabel !== undefined &&
          Util.getScoreName(infoBoxData.jeeLabel)}
        {flowValuesKnown &&
          infoBoxData.flowValues.map(d => (
            <div className={styles.flowValues}>
              {d.value}
              <br />
              {d.label()}
            </div>
          ))}
        {!flowValuesKnown && (
          <div className={styles.unknownValuesMessage}>
            <div>{infoBoxData.unknownValueExplanation}</div>
            <div>Specific amounts not indicated.</div>
          </div>
        )}
        <Link to={`/details/${nodeData.id}/${entityRole}`}>
          <button>View funding details</button>
        </Link>
      </div>
    </div>
  );
};

export default InfoBox;
