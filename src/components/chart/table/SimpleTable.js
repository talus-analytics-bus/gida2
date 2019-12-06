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
    // let rows = [];
    // data.forEach(d => {
    //   const row = {
    //     name: d.focus_node_id
    //   };
    //   for (const [key, val] of Object.entries(d.flow_types)) {
    //     row[key] = val.focus_node_weight;
    //   }
    //   rows.push(row);
    // });
    // // If limit then truncate data
    // if (props.limit !== undefined) {
    //   rows = rows.slice(0, props.limit);
    // }
    // return rows;
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
                {Util.formatValue(r[cn.name], cn.name)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimpleTable;
