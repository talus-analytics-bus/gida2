import React from "react";
import ReactTooltip from "react-tooltip";
import styles from "./map.module.scss";
import tooltipStyles from "../../../../../common/tooltip.module.scss";
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
import { getJeeScores, getNodeLinkList } from "../../../../../misc/Data.js";

// FC for Map.
const Map = ({
  data,
  supportType,
  flowType,
  entityRole,
  minYear,
  maxYear,
  coreCapacities,
  jeeScores,
  ghsaOnly,
  isDark,
  ...props
}) => {
  // Get node type from entity role
  const nodeType = entityRole === "funder" ? "source" : "target";

  // Get map color scale to use.
  const colorScale = getMapColorScale({
    supportType: supportType,
    data: data,
    flowType: flowType,
    jeeScores,
    coreCapacities,
    entityRole
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
  const [nodeData, setNodeData] = React.useState(undefined);
  const [tooltipCountry, setTooltipCountry] = React.useState(undefined);
  const [tooltipNodeData, setTooltipNodeData] = React.useState(undefined);
  console.log("tooltipNodeData");
  console.log(tooltipNodeData);

  // Define "columns" for map data.
  const d3MapDataFields = [
    {
      title: "Location (JSON)",
      prop: nodeType,
      type: "text",
      func: d => JSON.stringify(d[nodeType]),
      render: d =>
        getNodeLinkList({
          urlType: "details",
          nodeList: JSON.parse(d),
          entityRole: entityRole,
          id: undefined,
          otherId: undefined
        })
    },
    {
      title: "Location (ID)",
      prop: "id",
      type: "text",
      func: d => d[nodeType][0].id,
      render: d => d
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
          forTooltip: false,
          scores: jeeScores
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
          forTooltip: true,
          scores: jeeScores
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
            coreCapacities,
            scores: jeeScores
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
          coreCapacities,
          scores: jeeScores
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
      func: d =>
        getMapMetricValue({
          d,
          supportType,
          flowType,
          coreCapacities,
          scores: jeeScores
        })
    }
  ];

  // Get data for d3Map
  let mapData;
  if (supportType !== "jee") {
    mapData = getTableRowData({ tableRowDefs: d3MapDataFields, data });
  } else {
    const jeeScoreData = [];
    // if place not in data...
    for (let place_id in jeeScores) {
      jeeScoreData.push({
        [nodeType]: [
          {
            id: parseInt(place_id)
          }
        ]
      });
    }
    mapData = getTableRowData({
      tableRowDefs: d3MapDataFields,
      data: jeeScoreData
    });
  }
  console.log("mapData");
  console.log(mapData);
  // Get datum for the selected node, if it exists.
  const datumForInfoBox =
    nodeData !== undefined
      ? data.find(d => d[nodeType].find(dd => dd.id === nodeData.id))
      : undefined;
  const datumForTooltip =
    tooltipNodeData !== undefined
      ? data.find(d => d[nodeType].find(dd => dd.id === tooltipNodeData.id))
      : undefined;

  /**
   * Return flow values for display in the InfoBox for the selected node, given
   * the support type to show (usually funds, but can be inkind).
   * @method getFlowValues
   * @param  {String}      [supportTypeForValues="funds"] [description]
   * @return {[type]}                                     [description]
   */
  const getFlowValues = ({
    supportTypeForValues = "funds",
    datum,
    transactionType
  }) => {
    // Define the flows that should be used to get the flow values.
    const flowsTmp =
      supportTypeForValues === "funds"
        ? ["committed_funds", "disbursed_funds"]
        : ["committed_inkind", "provided_inkind"];

    let flows;
    if (transactionType !== undefined) {
      if (transactionType === "committed") flows = [flowsTmp[0]];
      else flows = [flowsTmp[1]];
    } else {
      flows = flowsTmp;
    }

    // If the datum is undefined, return "zeros" for the flow values.
    if (datum === undefined) {
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
              d: datum,
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

  const getInfoBoxData = (nodeDataToCheck, mapData, datum, simple = false) => {
    // If a node has been selected, get the info box data for it.
    // First, get the JEE score for the node, if it exists. If it is not avail,
    // then 'scoreOfNode' is undefined.
    let scoreOfNode;
    if (
      // There is a node selected...
      nodeDataToCheck !== undefined &&
      // and the support type being viewed is one that shows the JEE score...
      (supportType === "jee" || supportType === "needs_met")
    ) {
      // Get JEE score (avg) to display.
      const jeeScoresToAvg = getJeeScores({
        scores: jeeScores, // TODO
        iso2: nodeDataToCheck.id, // TODO
        coreCapacities
      });

      // Average JEE score is mean.
      const avgJeeScore = d3.mean(jeeScoresToAvg, d => d.score);
      scoreOfNode = avgJeeScore;
    }

    // Define the InfoBox data passed to the InfoBox component. By default the
    // flow values are all zeroes.
    const transactionTypeTmp =
      flowType.startsWith("committed") && supportType !== "needs_met"
        ? "committed"
        : "disbursed";
    const transactionType = simple ? transactionTypeTmp : undefined;
    const nodeMapData =
      nodeDataToCheck !== undefined
        ? mapData.find(d => d.id === nodeDataToCheck.id)
        : undefined;
    let infoBoxData = {
      scoreOfNode: scoreOfNode,
      flowValues: getFlowValues({
        supportTypeForValues: supportType,
        datum: datum,
        transactionType
      }),
      colorScale: colorScale
    };

    // Get the node data that is in the table of values for display in the map.

    // If we have data to put in the InfoBox:
    if (nodeMapData !== undefined && datum !== undefined) {
      // Define a value with which to determine the color of the InfoBox header.
      // This will be overriden by 'jeeLabel' if the supportType is 'jee'.
      infoBoxData.colorValue = nodeMapData.value_raw;

      // If unknown value applies, get the message for it, explaining why the
      // value is unknown (e.g., country is marked as a funder for a multilateral
      // project in which their specific contribution is not known).
      infoBoxData.unknownValueExplanation = getUnknownValueExplanation({
        datum,
        value: getMapMetricValue({
          d: datum,
          supportType,
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
            supportTypeForValues: "funds",
            datum,
            transactionType
          });
          break;

        // Inkind data: show amount committed/provided
        case "inkind":
          infoBoxData.flowValues = getFlowValues({
            supportTypeForValues: "inkind",
            datum,
            transactionType
          });
          break;

        // JEE data / needs met: show amount committed/disbursed and JEE score
        case "needs_met":
        case "jee":
          infoBoxData.flowValues = getFlowValues({
            supportTypeForValues: "funds",
            datum,
            transactionType
          });
          break;

        default:
          break;
      }
    }
    return infoBoxData;
  };
  const infoBoxData = getInfoBoxData(nodeData, mapData, datumForInfoBox);
  const tooltipData =
    tooltipNodeData !== undefined
      ? getInfoBoxData(tooltipNodeData, mapData, datumForTooltip, true)
      : undefined;

  console.log("tooltipData");
  console.log(tooltipData);

  return (
    <div className={classNames(styles.map, { [styles.dark]: isDark })}>
      <D3Map
        {...{
          mapData,
          setTooltipNodeData,
          colorScale,
          flowType,
          entityRole,
          minYear,
          maxYear,
          supportType,
          coreCapacities,
          d3MapDataFields,
          ghsaOnly,
          setNodeData
        }}
      />
      <div className={styles.legend}>
        <Legend {...{ colorScale, supportType, flowType, isDark }} />
      </div>
      <div className={styles.infoBox}>
        <InfoBox
          {...{
            entityRole,
            supportType,
            nodeData,
            setNodeData,
            infoBoxData,
            isDark
          }}
        />
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"mapTooltip"}
          type="light"
          className={classNames(tooltipStyles.tooltip, tooltipStyles.simple)}
          place="top"
          effect="float"
          getContent={() =>
            tooltipData && (
              <InfoBox
                {...{
                  simple: true,
                  entityRole,
                  supportType,
                  nodeData: tooltipNodeData,
                  setNodeData,
                  infoBoxData: tooltipData,
                  isDark
                }}
              />
            )
          }
        />
      }
    </div>
  );
};

export default Map;
