import React from "react";
import classNames from "classnames";
import styles from "./toptable.module.scss";
import Util from "../../misc/Util.js";

/**
 * Yearly metric report for countries that have irregular WHO data reporting.
 * Simple table of metric by year with data source.
 * @method TopTable
 */
const TopTable = ({ colNames, rows, ...props }) => {
  return (
    <table>
      <thead>
        {colNames.map(cn => (
          <th>
            <td>{cn}</td>
          </th>
        ))}
      </thead>
      <tbody>
        {rows.map(r => (
          <tr>
            <td>{r.name}</td>
            <td>{Util.money(r.disbursed_funds || 0)}</td>
            <td>{Util.money(r.committed_funds || 0)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TopTable;
