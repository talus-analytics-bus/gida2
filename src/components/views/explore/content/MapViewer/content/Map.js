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

  // Track selected node
  const [nodeData, setNodeData] = React.useState(getNodeData("Egypt"));

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
            style={{ fill: colorScale(d) }}
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

  // If a node has been selected, get the info box data for it
  let infoBoxData = {
    jeeLabel: undefined,
    flowValues: undefined
  };
  if (nodeData !== undefined) {
    const nodeMapData = mapData.find(d => d.focus_node_id === nodeData.id);
    const d = data.find(d => d.focus_node_id === nodeData.id);

    // If unknown value applies, get the message for it.
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
    const getFlowValues = (supportTypeForValues = "funds") => {
      const flows =
        supportTypeForValues === "funds"
          ? ["committed_funds", "disbursed_funds"]
          : ["committed_inkind", "provided_inkind"];
      return flows.map(f => {
        console.log("d");
        console.log(d);
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
    };

    // Get other data for info box depending on the support type.
    switch (supportType) {
      case "funds":
        infoBoxData.flowValues = getFlowValues();
        break;

      case "inkind":
        infoBoxData.flowValues = getFlowValues("inkind");
        break;

      case "jee":
        infoBoxData.jeeLabel = nodeMapData.value;
        infoBoxData.flowValues = getFlowValues();
        break;
      case "needs_met":
        // Get JEE score (avg) to display.
        const jeeScores = getJeeScores({
          scores: undefined, // TODO
          iso2: undefined, // TODO
          coreCapacities
        });
        const avgJeeScore = d3.mean(jeeScores, d => d.score);
        infoBoxData.jeeLabel = avgJeeScore;
        infoBoxData.flowValues = getFlowValues("funds");
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
