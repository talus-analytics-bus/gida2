import React from "react";
import styles from "./d3map.module.scss";
import TableInstance from "../chart/table/TableInstance.js";
import WorldMap from "./worldMap.js";

// import {
//   getMapMetricValue,
//   getMapTooltipLabel,
//   getUnknownValueExplanation
// } from "../map/MapUtil.js";
// import { getJeeScores } from "../misc/Data.js";

// FC
const D3Map = ({
  mapData,
  colorScale,
  flowType,
  entityRole,
  minYear,
  maxYear,
  supportType,
  coreCapacities,
  d3MapDataFields,
  ghsaOnly,
  ...props
}) => {
  console.log("Flow type: " + flowType);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [worldMap, setWorldMap] = React.useState(null);

  // Create map the first time it's loaded.
  React.useEffect(() => {
    const worldMapNew = new WorldMap("." + styles.worldMap, { setMapLoaded });
    setWorldMap(worldMapNew);
  }, []);

  // Update map coloring and tooltips etc. whenever flowtype is updated.
  React.useEffect(() => {
    if (mapLoaded) {
      worldMap.colorCountries(
        mapData.map(dd => {
          return { id: dd.id, value: dd.value, color: colorScale(dd.color) };
        })
      );
    }
  }, [
    mapLoaded,
    flowType,
    supportType,
    entityRole,
    minYear,
    maxYear,
    coreCapacities,
    ghsaOnly
  ]);

  const placeholderTable = (
    <TableInstance
      useRowDataAsIs={true}
      tableColumns={d3MapDataFields}
      tableData={mapData}
      sortByProp={"value_raw"}
    />
  );

  return (
    <div className={styles.d3Map}>
      {
        // placeholderTable
      }
      {<div className={styles.worldMap} />}
      {
        // Append defs svg
        <svg className={styles.defsSvg} height="100%" width="100%">
          <defs>
            <g id="hatchDefs">
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
            </g>
          </defs>
        </svg>
      }
    </div>
  );
};

export default D3Map;
