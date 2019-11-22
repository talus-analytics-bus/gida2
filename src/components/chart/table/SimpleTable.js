import React from "react";
import classNames from "classnames";
import styles from "./simpletable.module.scss";
import Util from "../../misc/Util.js";

/**
 * Yearly metric report for countries that have irregular WHO data reporting.
 * Simple table of metric by year with data source.
 * @method SimpleTable
 */
const SimpleTable = ({ colInfo, data, ...props }) => {
  const getRows = data => {
    let rows = [];
    data.forEach(d => {
      const row = {
        name: d.focus_node_id
      };
      for (const [key, val] of Object.entries(d.flow_types)) {
        row[key] = val.focus_node_weight;
      }
      rows.push(row);
    });
    // If limit then truncate data
    if (props.limit !== undefined) {
      rows = rows.slice(0, props.limit);
    }
    return rows;
  };
  const rows = getRows(data);

  // Return table (TODO in jQuery DataTable, probably)
  return (
    <table className={styles.simpletable}>
      <thead>
        {colInfo.map(cn => (
          <th>
            <td>{cn.display_name}</td>
          </th>
        ))}
      </thead>
      <tbody>
        {rows.map(r => (
          <tr>
            {colInfo.map(cn => (
              <td>{Util.formatValue(r[cn.name], cn.name)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimpleTable;
