import React, { useState, useEffect } from "react";
import styles from "./chord.module.scss";
import classNames from "classnames";
import TableInstance from "../../../chart/table/TableInstance.js";
import Util from "../../../misc/Util.js";
import FlowBundleGeneralQuery from "../../../misc/FlowBundleGeneralQuery.js";
import { Settings } from "../../../../App.js";
import D3Chord from "../../../chart/D3Chord/D3Chord.js";
import ReactTooltip from "react-tooltip";
import tooltipStyles from "../../../common/tooltip.module.scss";

// FC for Chord.
const Chord = ({
  chordData,
  transactionType,
  setSelectedEntity,
  setEntityArcInfo,
  selectedEntity,
  setShowInfo,
  ...props
}) => {
  const [chord, setChord] = useState(null);
  const [noChart, setNoChart] = useState(false);
  const [tooltipData, setTooltipData] = useState(false);

  // Initial load: draw chord diagram
  useEffect(() => {
    setSelectedEntity(null);
    setShowInfo(false);
    const chordNew = new D3Chord("." + styles.chordChart, {
      chordData,
      setSelectedEntity,
      selectedEntity,
      transactionType,
      setEntityArcInfo,
      noResizeEvent: true,
      setTooltipData,
    });
    setChord(chordNew);
    setNoChart(chordData.length === 0);
  }, [chordData, transactionType]);

  useEffect(() => {
    if (chord !== null) {
      chord.params.selectedEntity = selectedEntity;
      if (selectedEntity !== null) {
        chord.highlight(selectedEntity);
      } else {
        chord.unHighlight();
      }
    }
  }, [selectedEntity]);

  return (
    <div className={styles.chord}>
      <div className={styles.chordChart} />
      <div
        className={classNames(styles.noDataMessage, { [styles.show]: noChart })}
      >
        No data for selected filters
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"analysisTooltip"}
          type="light"
          className={tooltipStyles.tooltip}
          place="top"
          effect="float"
          getContent={() =>
            tooltipData && (
              <table>
                {tooltipData.map(d => (
                  <tr>
                    <td>{d.field}:</td>&nbsp;<td>{d.value}</td>
                  </tr>
                ))}
              </table>
            )
          }
        />
      }
    </div>
  );
};

export default Chord;
