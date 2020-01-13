import React from "react";
import styles from "./chord.module.scss";
import TableInstance from "../../../chart/table/TableInstance.js";
import Util from "../../../misc/Util.js";
import { Settings } from "../../../../App.js";

// FC for Chord.
const Chord = ({ data, ...props }) => {
  const chordPlaceholder = (
    <TableInstance
      tableColumns={[
        {
          title: "Source",
          prop: "source",
          type: "text",
          func: d => d.source.map(dd => dd.name).join("; ")
        },
        {
          title: "Target",
          prop: "target",
          type: "text",
          func: d => d.target.map(dd => dd.name).join("; ")
        },
        {
          title: `Amount committed (${Settings.startYear} - ${
            Settings.endYear
          })`,
          prop: "committed_funds",
          type: "num",
          func: d =>
            d.flow_types.committed_funds !== undefined
              ? d.flow_types.committed_funds.focus_node_weight
              : "",
          render: d => Util.formatValue(d, "committed_funds")
        },
        {
          title: `Amount disbursed (${Settings.startYear} - ${
            Settings.endYear
          })`,
          prop: "disbursed_funds",
          type: "num",
          func: d =>
            d.flow_types.disbursed_funds !== undefined
              ? d.flow_types.disbursed_funds.focus_node_weight
              : "",
          render: d => Util.formatValue(d, "disbursed_funds")
        }
      ]}
      tableData={data}
    />
  );

  return <div className={styles.chord}>{chordPlaceholder}</div>;
};

export default Chord;
