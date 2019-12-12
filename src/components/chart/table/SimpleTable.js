import React from "react";
import classNames from "classnames";
import styles from "./simpletable.module.scss";
import Util from "../../misc/Util.js";

/**
 * Simple table for displaying data (proof-of-concept)
 * @method SimpleTable
 */
const SimpleTable = ({ colInfo, data, rows, ...props }) => {
  const getRows = data => {
    return data.slice(0, props.limit);
  };

  if (rows === undefined) rows = getRows(data);

  // Return table (TODO in jQuery DataTable, probably)
  const width = (100 / colInfo.length).toString() + "%";
  return (
    <table className={styles.simpletable}>
      <thead>
        {colInfo.map(cn => (
          <th>
            <td style={{ width: width }}>{cn.display_name}</td>
          </th>
        ))}
      </thead>
      <tbody>
        {rows.map(r => (
          <tr>
            {colInfo.map(cn => (
              <td style={{ width: width }}>
                {Util.formatValue(cn.get(r), cn.fmtName)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimpleTable;
