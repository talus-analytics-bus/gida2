import React from "react";
import styles from "./map.module.scss";
import classNames from "classnames";
import * as d3 from "d3/dist/d3.min";

// Local content components
import D3Map from "../../../../../d3map/D3Map.js";
import Legend from "../../../../../map/Legend.js";
import InfoBox from "../../../../../map/InfoBox.js";
import {
  getMapTooltipLabel,
  getUnknownValueExplanation,
  getMapColorScale,
  getMapMetricValue
} from "../../../../../map/MapUtil.js";
import { getNodeData, getTableRowData } from "../../../../../misc/Data.js";
import Util from "../../../../../misc/Util.js";
import { getJeeScores } from "../../../../../misc/Data.js";

// FC for Map.
const Map = ({
  data,
  supportType,
  flowType,
  entityRole,
  minYear,
  maxYear,
  coreCapacities,
  ...props
}) => {
  // Get map color scale to use.
  const colorScale = getMapColorScale({
    supportType: supportType,
    data: data,
    flowType: flowType
  });

  // Define hatch mark pattern.
  const defs = (
    <defs>
      <pattern
        id="pattern-stripe"
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect
          width="3.5"
          height="4"
          transform="translate(0,0)"
          fill="lightgray"
        />
      </pattern>
      <mask id="mask-stripe">
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#pattern-stripe)"
        />
      </mask>
    </defs>
  );

  // Track selected node (i.e., the clicked country whose info box is also
  // visible).
  const [nodeData, setNodeData] = React.useState(getNodeData("Philippines"));

  // Define "columns" for map data.
  const d3MapDataFields = [
    {
      title: "Location",
      prop: "focus_node_id",
      type: "text",
      render: d => d,
      func: d => d.focus_node_id
    },
    {
      title: "Map metric raw value",
      prop: "value_raw",
      type: "num",
      func: d =>
        getMapMetricValue({
          d,
          supportType,
          flowType,
          coreCapacities,
          forTooltip: false
        })
    },
    {
      title: "Map metric display value",
      prop: "value",
      type: "num",
      render: d => Util.formatValue(d, supportType),
      func: d =>
        getMapMetricValue({
          d,
          supportType,
          flowType,
          coreCapacities,
          forTooltip: true
        })
    },
    {
      title: "Unknown value explanation (if applicable)",
      prop: "unknown_explanation",
      type: "text",
      render: d => Util.formatValue(d, "text"),
      func: d =>
        getUnknownValueExplanation({
          datum: d,
          value: getMapMetricValue({
            d,
            supportType,
            flowType,
            coreCapacities
          }),
          entityRole: entityRole
        })
    },
    {
      title: "Map tooltip label",
      prop: "tooltip_label",
      type: "text",
      render: d =>
        getMapTooltipLabel({
          val: d,
          supportType,
          flowType,
          minYear,
          maxYear,
          entityRole
        }),
      func: d =>
        getMapMetricValue({
          d,
          supportType,
          flowType,
          coreCapacities
        })
    },
    {
      title: "Color",
      prop: "color",
      type: "text",
      render: d => (
        <svg width="20" height="20">
          <rect
            style={{
              fill:
                supportType === "jee"
                  ? colorScale(Util.getScoreShortName(d))
                  : colorScale(d)
            }}
            className={classNames(styles.square, {
              [styles.hatch]: d === "yyy" || d === -8888
            })}
          />
          {defs}
        </svg>
      ),
      func: d => getMapMetricValue({ d, supportType, flowType, coreCapacities })
    }
  ];

  // Get data for d3Map
  const mapData = getTableRowData({ tableRowDefs: d3MapDataFields, data });

  // Get datum for the selected node, if it exists.
  const d =
    nodeData !== undefined
      ? data.find(d => d.focus_node_id === nodeData.id)
      : undefined;

  /**
   * Return flow values for display in the InfoBox for the selected node, given
   * the support type to show (usually funds, but can be inkind).
   * @method getFlowValues
   * @param  {String}      [supportTypeForValues="funds"] [description]
   * @return {[type]}                                     [description]
   */
  const getFlowValues = ({ supportTypeForValues = "funds" }) => {
    // Define the flows that should be used to get the flow values.
    const flows =
      supportTypeForValues === "funds"
        ? ["committed_funds", "disbursed_funds"]
        : ["committed_inkind", "provided_inkind"];

    // If the datum is undefined, return "zeros" for the flow values.
    if (d === undefined) {
      return flows.map(f => {
        return {
          value: Util.formatValue(0, f),
          label() {
            return getMapTooltipLabel({
              val: this.value,
              supportType: supportTypeForValues,
              flowType: f,
              minYear,
              maxYear,
              entityRole
            });
          }
        };
      });
    } else {
      // Otherwise, return an array with one object for each flow value that
      // contains (1) the value to be displayed, formatted; and (2) the label
      // that goes beneath that value, returned by a function "label".
      return flows.map(f => {
        return {
          value: Util.formatValue(
            getMapMetricValue({
              d,
              supportType: supportTypeForValues,
              flowType: f,
              coreCapacities
            }) || 0,
            f
          ),
          label() {
            return getMapTooltipLabel({
              val: this.value,
              supportType: supportTypeForValues,
              flowType: f,
              minYear,
              maxYear,
              entityRole
            });
          }
        };
      });
    }
  };
  // If a node has been selected, get the info box data for it.
  // First, get the JEE score for the node, if it exists. If it is not avail,
  // then 'jeeScoreOfNode' is undefined.
  let jeeScoreOfNode;
  if (
    // There is a node selected...
    nodeData !== undefined &&
    // and the support type being viewed is one that shows the JEE score...
    (supportType === "jee" || supportType === "needs_met")
  ) {
    // Get JEE score (avg) to display.
    const jeeScores = getJeeScores({
      scores: undefined, // TODO
      iso2: undefined, // TODO
      coreCapacities
    });

    // Average JEE score is mean.
    const avgJeeScore = d3.mean(jeeScores, d => d.score);
    jeeScoreOfNode = avgJeeScore;
  }

  // Define the InfoBox data passed to the InfoBox component. By default the
  // flow values are all zeroes.
  let infoBoxData = {
    jeeScoreOfNode: jeeScoreOfNode,
    flowValues: getFlowValues({
      supportTypeForValues: "funds"
    }),
    colorScale: colorScale
  };

  // Get the node data that is in the table of values for display in the map.
  const nodeMapData =
    nodeData !== undefined
      ? mapData.find(d => d.focus_node_id === nodeData.id)
      : undefined;

  // If we have data to put in the InfoBox:
  if (nodeMapData !== undefined && d !== undefined) {
    // Define a value with which to determine the color of the InfoBox header.
    // This will be overriden by 'jeeLabel' if the supportType is 'jee'.
    infoBoxData.colorValue = nodeMapData.value_raw;

    // If unknown value applies, get the message for it, explaining why the
    // value is unknown (e.g., country is marked as a funder for a multilateral
    // project in which their specific contribution is not known).
    infoBoxData.unknownValueExplanation = getUnknownValueExplanation({
      datum: d,
      value: getMapMetricValue({
        d,
        supportType: supportType === "jee" ? "funds" : supportType,
        flowType,
        coreCapacities
      }),
      entityRole: entityRole
    });

    // Get other data for info box depending on the support type.
    switch (supportType) {
      // Funding data: show amount committed/disbursed
      case "funds":
        infoBoxData.flowValues = getFlowValues({
          supportTypeForValues: "funds"
        });
        break;

      // Inkind data: show amount committed/provided
      case "inkind":
        infoBoxData.flowValues = getFlowValues({
          supportTypeForValues: "inkind"
        });
        break;

      // JEE data / needs met: show amount committed/disbursed and JEE score
      case "needs_met":
      case "jee":
        infoBoxData.flowValues = getFlowValues({
          supportTypeForValues: "funds"
        });
        break;

      default:
        break;
    }
    // If JEE label, then specify
    // If flow values, then specify
  }

  return (
    <div className={styles.map}>
      <D3Map
        {...{
          mapData,
          colorScale,
          flowType,
          entityRole,
          minYear,
          maxYear,
          supportType,
          coreCapacities,
          d3MapDataFields
        }}
      />
      <Legend {...{ colorScale, supportType, flowType }} />
      <InfoBox
        {...{
          entityRole,
          supportType,
          nodeData,
          setNodeData,
          infoBoxData
        }}
      />
    </div>
  );
};

export default Map;
