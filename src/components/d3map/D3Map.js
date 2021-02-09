import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./d3map.module.scss";
import TableInstance from "../chart/table/TableInstance.js";
import WorldMap from "./worldMap.js";
import Util from "../misc/Util.js";
import { Stakeholder } from "../misc/Queries";
import axios from "axios";

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
  events,
  d3MapDataFields,
  ghsaOnly,
  setNodeData,
  setTooltipNodeData,
  isDark,
  setLoaded,
  ...props
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [worldMap, setWorldMap] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [tooltipCountry, setTooltipCountry] = useState(null);
  const [init, setInit] = useState(true);

  // Create map the first time it's loaded.
  useEffect(() => {
    const worldMapNew = new WorldMap("." + styles.worldMap, {
      setMapLoaded,
      setActiveCountry,
      activeCountry,
      setTooltipCountry,
    });
    setWorldMap(worldMapNew);
  }, []);

  // Update active country if it changes
  useEffect(() => {
    if (worldMap !== null) {
      worldMap.params.activeCountry = activeCountry;
      if (activeCountry !== null) {
        Stakeholder({ iso3: activeCountry }).then(d => {
          setNodeData(d[0]);
        });
      } else {
        setNodeData(undefined);
      }
    }
  }, [activeCountry]);

  // Update tooltip country if it changes
  useEffect(() => {
    if (worldMap !== null) {
      if (tooltipCountry !== null) {
        Stakeholder({ iso3: tooltipCountry }).then(d => {
          setTooltipNodeData(d[0]);
        });
      } else {
        setTooltipNodeData(undefined);
      }
    }
  }, [tooltipCountry]);

  // Update map coloring and tooltips etc. whenever view options are changed
  useEffect(() => {
    if (mapLoaded) {
      setLoaded(true);
      console.log("worldMap.colorCountries - D3Map.js");
      worldMap.colorCountries(
        mapData.map(dd => {
          return {
            iso3: dd.iso3,
            value: dd.value,
            color: colorScale(dd.color),
          };
        }),
        init
      );
      setInit(false);
    }
  }, [
    mapData,
    // flowType,
    // supportType,
    // entityRole,
    // minYear,
    // maxYear,
    // coreCapacities,
    // events,
    // ghsaOnly,
  ]);

  return (
    <div
      className={classNames(styles.d3Map, {
        [styles.loading]: worldMap === null,
      })}
    >
      {
        <div
          className={classNames(styles.worldMap, {
            [styles.dark]: isDark,
            [styles.loaded]: !init,
          })}
        />
      }
      {
        // Append defs svg
        <svg className={styles.defsSvg} height="100%" width="100%">
          <defs>
            <g id="shadowDefs">
              <filter
                id="dropShadowCountry"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  in="SourceAlpha"
                  stdDeviation="1"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  result="matrixOut"
                  values="
							0 0 0 0 0
							0 0 0 0 0
							0 0 0 0 0
							0 0 0 1 0
						"
                />
                <feMerge>
                  <feMergeNode in="matrixOut" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </g>
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
