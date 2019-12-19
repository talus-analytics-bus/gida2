import React from "react";
import styles from "./infobox.module.scss";
import classNames from "classnames";
import Util from "../misc/Util.js";

/**
 * Create the info box to show details about selected map country.
 * @method InfoBox
 */
const InfoBox = ({ ...props }) => {
  // Track whether info box is visible or not
  const [show, setShow] = React.useState(true);

  return (
    <div className={classNames(styles.infoBox, { [styles.show]: show })}>
      InfoBox placeholder
    </div>
  );
};

export default InfoBox;
