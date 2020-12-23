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
  getMapMetricValue,
} from "../../../../../map/MapUtil.js";
import {
  getNodeData,
  getTableRowData,
  getInfoBoxData,
  calculateNeedsMet,
  getFlowValues,
} from "../../../../../misc/Data.js";
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
  events,
  jeeScores,
  ghsaOnly,
  isDark,
  setLoadingSpinnerOn,
  ...props
}) => {
  // Get node type from entity role
  const nodeType = entityRole === "funder" ? "origin" : "target";

  // Get map color scale to use.
  const colorScale = getMapColorScale({
    supportType: supportType,
    data: data,
    flowType: flowType,
    jeeScores,
    coreCapacities,
    entityRole,
  });

  // Define hatch mark pattern.
  // const defs = (
  //   <defs>
  //     <pattern
  //       id="pattern-stripe"
  //       width="4"
  //       height="4"
  //       patternUnits="userSpaceOnUse"
  //       patternTransform="rotate(45)"
  //     >
  //       <rect
  //         width="3.5"
  //         height="4"
  //         transform="translate(0,0)"
  //         fill="lightgray"
  //       />
  //     </pattern>
  //     <mask id="mask-stripe">
  //       <rect
  //         x="0"
  //         y="0"
  //         width="100%"
  //         height="100%"
  //         fill="url(#pattern-stripe)"
  //       />
  //     </mask>
  //   </defs>
  // );

  // Track selected node (i.e., the clicked country whose info box is also
  // visible).
  const [nodeData, setNodeData] = React.useState(undefined);
  const [tooltipCountry, setTooltipCountry] = React.useState(undefined);
  const [tooltipNodeData, setTooltipNodeData] = React.useState(undefined);

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
          otherId: undefined,
        }),
    },
    {
      title: "Location (ID)",
      prop: "id",
      type: "text",
      func: d => d[nodeType].id,
      render: d => d,
    },
    {
      title: "Location (ISO3)",
      prop: "iso3",
      type: "text",
      func: d => d[nodeType].iso3,
      render: d => d,
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
          scores: jeeScores,
        }),
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
          scores: jeeScores,
        }),
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
            scores: jeeScores,
          }),
          entityRole: entityRole,
        }),
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
          entityRole,
        }),
      func: d =>
        getMapMetricValue({
          d,
          supportType,
          flowType,
          coreCapacities,
          scores: jeeScores,
        }),
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
                  : colorScale(d),
            }}
            className={classNames(styles.square, {
              [styles.hatch]: d === "yyy" || d === -8888,
            })}
          />
          {
            // defs
          }
        </svg>
      ),
      func: d =>
        getMapMetricValue({
          d,
          supportType,
          flowType,
          coreCapacities,
          scores: jeeScores,
        }),
    },
  ];

  // Get data for d3Map
  let mapData;
  if (supportType !== "jee") {
    // add missing countries as zeros
    const dataArr = Object.values(data);
    mapData = getTableRowData({ tableRowDefs: d3MapDataFields, data: dataArr });

    if (supportType === "needs_met") {
      for (let iso3 in jeeScores) {
        const match = mapData.find(d => d.id === parseInt(iso3));
        if (match === undefined) {
          // Get score avg.
          const scores = getJeeScores({
            scores: jeeScores,
            iso3,
            coreCapacities,
          });
          const avgJeeScore = d3.mean(scores, d => d.score);

          const datum = {
            disbursed_funds: 0,
          };
          const value = calculateNeedsMet({ datum, avgCapScores: avgJeeScore });
          mapData.push({
            iso3,
            value: 0,
            value_raw: value,
            tooltip_label: 0,
            color: value,
            target: JSON.stringify([
              {
                iso3: "TBD",
                name: "TBD",
                type: "country",
              },
            ]),
          });
        }
      }
    }
  } else {
    const jeeScoreData = [];
    for (let iso3 in jeeScores) {
      jeeScoreData.push({
        [nodeType]: {
          iso3,
        },
        value_raw: 5,
      });
    }
    mapData = getTableRowData({
      tableRowDefs: d3MapDataFields,
      data: jeeScoreData,
    });
  }
  // Get datum for the selected node, if it exists.
  const datumForInfoBox =
    nodeData !== undefined
      ? data.find(d => d[nodeType].iso3 === nodeData.iso3)
      : undefined;
  const datumForTooltip =
    tooltipNodeData !== undefined
      ? data.find(d => d[nodeType].iso3 === tooltipNodeData.iso3)
      : undefined;

  const infoBoxData = getInfoBoxData({
    nodeDataToCheck: nodeData,
    mapData,
    datum: datumForInfoBox,
    supportType,
    jeeScores,
    coreCapacities,
    colorScale,
    entityRole,
    minYear,
    maxYear,
    flowType,
    simple: false,
  });

  const tooltipData =
    tooltipNodeData !== undefined
      ? getInfoBoxData({
          nodeDataToCheck: tooltipNodeData,
          mapData,
          datum: datumForTooltip,
          supportType,
          jeeScores,
          coreCapacities,
          colorScale,
          entityRole,
          minYear,
          maxYear,
          flowType,
          simple: true,
        })
      : undefined;
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
          events,
          d3MapDataFields,
          ghsaOnly,
          setNodeData,
          setLoadingSpinnerOn,
          isDark,
        }}
      />
      <div className={styles.legend}>
        <Legend
          {...{
            colorScale,
            supportType,
            flowType,
            isDark,
            entityRole,
            style: { borderBottom: "none" },
          }}
        />
      </div>
      <div className={styles.infoBox}>
        <InfoBox
          {...{
            entityRole,
            supportType,
            nodeData,
            setNodeData,
            infoBoxData,
            isDark,
            style: { border: "1px solid #ccc" },
          }}
        />
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"mapTooltip"}
          type="light"
          className={classNames(tooltipStyles.tooltip, tooltipStyles.simple, {
            [tooltipStyles.dark]: isDark,
          })}
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
                  isDark,
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
