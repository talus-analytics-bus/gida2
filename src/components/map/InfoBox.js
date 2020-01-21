import React from "react";
import { Link } from "react-router-dom";
import styles from "./infobox.module.scss";
import classNames from "classnames";
import Util from "../misc/Util.js";
import Button from "../common/Button/Button.js";
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
  const [show, setShow] = React.useState(nodeData !== undefined);

  React.useEffect(() => setShow(nodeData !== undefined), [nodeData]);
  // Define whether the flow values are known or not (defined or not).
  // If they're not defined, will display a message explaining.
  const flowValuesKnown =
    infoBoxData.unknownValueExplanation === undefined &&
    infoBoxData.flowValues !== undefined;

  // Define header color -- use JEE color if JEE is view, otherwise use
  // color scale of selected metric.
  const getHeaderStyle = ({ infoBoxData, supportType }) => {
    if (
      infoBoxData.colorValue === undefined ||
      infoBoxData.colorValue === -9999
    ) {
      return {
        baseColor: "#ccc",
        style: {
          backgroundColor: "#ccc"
        }
      };
    } else if (infoBoxData.colorValue === -8888) {
      return {
        baseColor: "#ccc",
        style: {
          background:
            "repeating-linear-gradient(-45deg, #ccc, #ccc 17px, #fff 17px, #fff 20px)"
        }
      };
    } else if (supportType === "jee") {
      const baseColor = infoBoxData.colorScale(
        Util.getScoreShortName(infoBoxData.scoreOfNode)
      );
      return {
        baseColor: baseColor,
        style: {
          backgroundColor: baseColor
        }
      };
    } else {
      const baseColor = infoBoxData.colorScale(infoBoxData.colorValue);
      return {
        baseColor: baseColor,
        style: {
          backgroundColor: baseColor
        }
      };
    }
  };

  const headerStyle = getHeaderStyle({ infoBoxData, supportType });
  const headerColor = headerStyle.baseColor;
  const missingScore =
    (supportType === "jee" ||
      supportType === "pvs" ||
      supportType === "needs_met") &&
    infoBoxData.scoreOfNode === undefined;

  if (nodeData === undefined) return "";
  // TODO slide up somehow
  else
    return (
      <div className={classNames(styles.infoBox, { [styles.show]: show })}>
        <div
          style={headerStyle.style}
          className={classNames(styles.header, {
            [styles.darkFont]: Util.isLightColor(headerColor)
          })}
        >
          <div className={styles.name}>{nodeData.name}</div>
          <div className={styles.close}>
            <Button
              callback={() => {
                setShow(false);
                setNodeData(undefined);
              }}
              type={"close"}
            />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.score}>
            {infoBoxData.scoreOfNode !== undefined &&
              Util.getScoreName(infoBoxData.scoreOfNode)}
            {missingScore && <div>No score data available</div>}
          </div>
          <div>
            {supportType !== "jee" &&
              flowValuesKnown &&
              infoBoxData.flowValues.map(d => (
                <div className={styles.flowValues}>
                  <div>{d.value}</div>
                  <div>{d.label()}</div>
                </div>
              ))}
            {!flowValuesKnown && (
              <div className={styles.unknownValuesMessage}>
                <div>{infoBoxData.unknownValueExplanation}</div>
                <div>Specific amounts not indicated.</div>
              </div>
            )}
          </div>
          <Button
            linkTo={`/details/${nodeData.id}/${entityRole}`}
            label={"View funding details"}
            type={"primary"}
          />
        </div>
      </div>
    );
};

export default InfoBox;
