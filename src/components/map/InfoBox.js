import React from "react";
import { Link } from "react-router-dom";
import styles from "./infobox.module.scss";
import classNames from "classnames";
import Util from "../misc/Util.js";
// import * as d3 from "d3/dist/d3.min";

/**
 * Create the info box to show details about selected map country (node).
 * @method InfoBox
 */
const InfoBox = ({
  nodeData,
  setNodeData,
  supportType,
  color,
  colorIdx,
  entityRole = "funder", // For link button to details page
  infoBoxData = null,
  ...props
}) => {
  // Track whether info box is visible or not
  const [show, setShow] = React.useState(true);

  // Define whether the flow values are known or not (defined or not).
  // If they're not defined, will display a message explaining.
  const flowValuesKnown =
    infoBoxData.unknownValueExplanation === undefined &&
    infoBoxData.flowValues !== undefined;

  // Define header color -- use JEE color if JEE is view, otherwise use
  // color scale of selected metric.
  const headerColor =
    supportType === "jee"
      ? infoBoxData.colorScale(
          Util.getScoreShortName(infoBoxData.jeeScoreOfNode)
        )
      : infoBoxData.colorScale(infoBoxData.colorValue);

  console.log("infoBoxData");
  console.log(infoBoxData);
  console.log("nodeData");
  console.log(nodeData);
  if (nodeData === undefined) return "";
  // TODO slide up somehow
  else
    return (
      <div className={classNames(styles.infoBox, { [styles.show]: show })}>
        <div
          style={{
            backgroundColor: headerColor
          }}
          className={classNames(styles.header, {
            [styles.darkFont]: Util.isLightColor(headerColor)
          })}
        >
          <div className={styles.name}>{nodeData.name}</div>
          <div className={styles.close}>
            <button
              onClick={() => {
                setShow(false);
                setNodeData(undefined);
              }}
            >
              Close
            </button>
          </div>
        </div>
        <div className={styles.content}>
          {infoBoxData.jeeScoreOfNode !== undefined &&
            Util.getScoreName(infoBoxData.jeeScoreOfNode)}
          {flowValuesKnown &&
            infoBoxData.flowValues.map(d => (
              <div className={styles.flowValues}>
                {d.value}
                <br />
                {d.label()}
              </div>
            ))}
          {!flowValuesKnown && (
            <div className={styles.unknownValuesMessage}>
              <div>{infoBoxData.unknownValueExplanation}</div>
              <div>Specific amounts not indicated.</div>
            </div>
          )}
          <Link to={`/details/${nodeData.id}/${entityRole}`}>
            <button>View funding details</button>
          </Link>
        </div>
      </div>
    );
};

export default InfoBox;
