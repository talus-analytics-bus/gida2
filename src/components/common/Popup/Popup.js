import React from "react";
import classNames from "classnames";
import styles from "./popup.module.scss";

/**
 * @method Popup
 */
const Popup = ({ data, ...props }) => {
  return (
    <div className={styles.popup}>
      <table>
        {data.map(d => (
          <tr>
            <td>{d.field}:</td>&nbsp;<td>{d.value}</td>
          </tr>
        ))}
      </table>
    </div>
  );
};

export default Popup;
