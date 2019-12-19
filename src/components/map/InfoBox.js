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
  nodeData = { id: "Smithsonian Institution", name: "Undefined name" },
  supportType,
  color,
  entityRole = "funder", // For link button to details page
  jeeLabel = null,
  flowValues = null, // the value and tooltip text for committment and disburse.
  ...props
}) => {
  // Track whether info box is visible or not
  const [show, setShow] = React.useState(true);

  const flowValuesKnown = flowValues !== null;

  return (
    <div className={classNames(styles.infoBox, { [styles.show]: show })}>
      <div className={styles.header}>
        <div className={styles.name}>{nodeData.name}</div>
        <div className={styles.close}>
          <button onClick={() => setShow(false)}>Close</button>
        </div>
      </div>
      <div className={styles.content}>
        {flowValuesKnown &&
          flowValues.map(d => (
            <div className={styles.flowValues}>Flow value placeholder</div>
          ))}
        {!flowValuesKnown && (
          <div className={styles.unknownValuesMessage}>
            <div>Unknown values message placeholder</div>
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
