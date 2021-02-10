import React, { useState, useEffect } from "react";
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
  loaded,
  setLoaded,
  ...props
}) => {
  // Get node type from entity role
  const nodeType = entityRole === "funder" ? "origin" : "target";

  const addNeedsMetDatum = ({
    d,
    dataNeedsMet,
    iso3WithJeeAdded,
    coreCapacities,
    iso3,
    jeeScores,
  }) => {
    const hasJee = jeeScores[iso3] !== undefined;
    const hasDisbursementOrZero =
      d.disbursed_funds === undefined || d.disbursed_funds >= 0;
    if (hasJee) {
      iso3WithJeeAdded.push(iso3);
      let needs_met = -9999;
      let avgJeeScore;
      if (hasDisbursementOrZero) {
        const scores = getJeeScores({
          scores: jeeScores,
          iso3,
          coreCapacities,
        });
        avgJeeScore = d3.mean(scores, d => d.score);

        needs_met = calculateNeedsMet({
          datum: d,
          avgCapScores: avgJeeScore,
        });
      }
      dataNeedsMet.push({
        ...d,
        needs_met,
        avgJeeScore,
      });
    }
  };

  const dataNeedsMet = [];
  if (supportType === "needs_met") {
    const iso3WithJeeAdded = [];
    data.forEach(d => {
      const iso3 = d.target !== undefined ? d.target.iso3 : d.origin.iso3;
      addNeedsMetDatum({
        d,
        dataNeedsMet,
        iso3WithJeeAdded,
        coreCapacities,
        iso3,
        jeeScores,
      });
    });

    // Add data for countries with JEE scores but no funds
    for (const iso3 in jeeScores) {
      if (!iso3WithJeeAdded.includes(iso3)) {
        addNeedsMetDatum({
          d: { target: { iso3 }, disbursed_funds: 0 },
          dataNeedsMet,
          iso3WithJeeAdded,
          coreCapacities,
          iso3,
          jeeScores,
        });
      }
    }

    // make null values equal to highest val
    const maxVal = d3.max(dataNeedsMet, d => d.needs_met);
    dataNeedsMet.forEach(d => {
      if (d.needs_met === null) d.needs_met = maxVal;
    });
  }

  const colorScale = getMapColorScale({
    supportType: supportType,
    data: data,
    dataNeedsMet,
    flowType: flowType,
    jeeScores,
    coreCapacities,
    entityRole,
  });

  // Track selected node (i.e., the clicked country whose info box is also
  // visible).
  const [nodeData, setNodeData] = useState(undefined);
  const [tooltipCountry, setTooltipCountry] = useState(undefined);
  const [tooltipNodeData, setTooltipNodeData] = useState(undefined);
  const [mapData, setMapData] = useState(null);

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
      title: "Any in-kind support?",
      prop: "has_inkind",
      type: "text",
      render: d => d,
      func: d => {
        // return true if inkind assistance for current flow type (disbursed or
        // committed) is defined, false otherwise
        const committed = ["committed_funds", "committed_inkind"].includes(
          flowType
        );
        if (committed && d.committed_inkind !== undefined) return true;
        else {
          const disbursed = ["disbursed_funds", "provided_inkind"].includes(
            flowType
          );
          return disbursed && d.provided_inkind !== undefined;
        }
      },
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
      // render: d => (
      //   <svg width="20" height="20">
      //     <rect
      //       style={{
      //         fill:
      //           supportType === "jee"
      //             ? colorScale(Util.getScoreShortName(d))
      //             : colorScale(d),
      //       }}
      //       className={classNames(styles.square, {
      //         [styles.hatch]: d === "yyy" || d === -8888,
      //       })}
      //     />
      //     {
      //       // defs
      //     }
      //   </svg>
      // ),
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
  // set map data when params are changed
  useEffect(() => {
    if (supportType !== "jee") {
      // add missing countries as zeros
      const dataArr =
        supportType === "needs_met" ? dataNeedsMet : Object.values(data);
      const newMapData = getTableRowData({
        tableRowDefs: d3MapDataFields,
        data: dataArr,
      });
      console.log("newMapData");
      console.log(newMapData);
      setMapData(newMapData);
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
      const newMapData = getTableRowData({
        tableRowDefs: d3MapDataFields,
        data: jeeScoreData,
      });
      setMapData(newMapData);
    }
  }, [data, supportType, flowType]);

  // Get datum for the selected node, if it exists.
  const existsDataForHover = data.length > 0 && data[0][nodeType] !== undefined;
  const datumForInfoBox =
    nodeData !== undefined && existsDataForHover
      ? data.find(d => d[nodeType].iso3 === nodeData.iso3)
      : undefined;
  const datumForTooltip =
    tooltipNodeData !== undefined && existsDataForHover
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
          setLoaded,
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
                  key: tooltipNodeData.id,
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
