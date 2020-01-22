import React from "react";
import styles from "./chord.module.scss";
import TableInstance from "../../../chart/table/TableInstance.js";
import Util from "../../../misc/Util.js";
import FlowBundleGeneralQuery from "../../../misc/FlowBundleGeneralQuery.js";
import { Settings } from "../../../../App.js";
import D3Chord from "../../../chart/D3Chord/D3Chord.js";

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
  const [chord, setChord] = React.useState(null);

  // Initial load: draw chord diagram
  React.useEffect(() => {
    setSelectedEntity(null);
    setShowInfo(false);
    const chordNew = new D3Chord("." + styles.chordChart, {
      chordData,
      setSelectedEntity,
      selectedEntity,
      transactionType,
      setEntityArcInfo,
      noResizeEvent: true
    });
    setChord(chordNew);
  }, [chordData, transactionType]);

  React.useEffect(() => {
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
    </div>
  );
};

export default Chord;
