import React from "react";
import classNames from "classnames";
import styles from "./toptable.module.scss";
import Util from "../../misc/Util.js";

/**
 * Yearly metric report for countries that have irregular WHO data reporting.
 * Simple table of metric by year with data source.
 * @method TopTable
 */
const TopTable = ({ metrics, flowTypeInfo, rows, ...props }) => {
  // Get column names
  const baseColNames = [{ name: "name", display_name: "Name" }];
  const colNames = baseColNames.concat(
    flowTypeInfo.filter(ft => metrics.includes(ft.name))
  );

  // Return table (TODO in jQuery DataTable, probably)
  return (
    <table>
      <thead>
        {colNames.map(cn => (
          <th>
            <td>{cn.display_name}</td>
          </th>
        ))}
      </thead>
      <tbody>
        {rows.map(r => (
          <tr>
            {colNames.map(cn => (
              <td>{Util.formatValue(r[cn.name], cn.name)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TopTable;
