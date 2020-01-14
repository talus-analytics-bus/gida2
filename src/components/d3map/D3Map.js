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

  // Initialize map after it loads.
  React.useEffect(() => {
    if (mapLoaded) {
      console.log("Map loaded!");
      console.log("mapData");
      console.log(mapData);
      worldMap.colorCountries(
        mapData.map(dd => {
          return { id: dd.name, color: colorScale(dd.color) };
        })
      );
    }
  }, [mapLoaded]);

  // Update map coloring and tooltips etc. whenever flowtype is updated.
  React.useEffect(() => {
    if (mapLoaded) {
      worldMap.colorCountries(
        mapData.map(dd => {
          return { id: dd.name, color: colorScale(dd.color) };
        })
      );
    }
  }, [
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
    </div>
  );
};

export default D3Map;
