import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./d3map.module.scss";
import TableInstance from "../chart/table/TableInstance.js";
import WorldMap from "./worldMap.js";
import Util from "../misc/Util.js";
import { noDataGray } from "../../assets/styles/colors.scss";
import { purples, greens, lightHatchColors } from "../map/MapUtil.js";
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
  const [colorSeries, setColorSeries] = useState(
    entityRole === "funder" ? greens : purples
  );

  // CONSTANTS //
  const colors = greens.concat(purples).concat([noDataGray]);
  const colorHash = {};
  colors.forEach((c, i) => {
    colorHash[c.toLowerCase() + entityRole] = i + 1;
  });

  // Create map the first time it's loaded.
  useEffect(() => {
    const worldMapNew = new WorldMap("." + styles.worldMap, {
      setMapLoaded,
      setActiveCountry,
      activeCountry,
      setTooltipCountry,
      supportType,
      colorHash,
      entityRole,
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
      worldMap.params.entityRole = entityRole;
      worldMap.params.colorHash = colorHash;
      if (entityRole === "funder") setColorSeries(greens);
      else setColorSeries(purples);
      worldMap.colorCountries(
        mapData.map(dd => {
          return {
            ...dd,
            color: colorScale(dd.color),
          };
        }),
        init
      );
      setInit(false);
    }
  }, [mapData]);

  // // When entity role changes, update color series used
  // useEffect(() => {
  //   if (entityRole === "funder") setColorSeries(greens);
  //   else setColorSeries(purples);
  // }, [entityRole]);

  // Update map params when certain state vars. change
  useEffect(() => {
    if (mapLoaded) {
      worldMap.params.supportType = supportType;
      worldMap.params.colorHash = colorHash;
    }
  }, [supportType, colorScale]);

  const stroke = 8;

  // JSX //
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
              {colors.map(c => (
                <pattern
                  id={`pattern-stripe-${
                    colorHash[c.toLowerCase() + entityRole]
                  }`}
                  width={stroke}
                  height="1"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect
                    width={stroke}
                    height={stroke}
                    transform="rotate(-45)"
                    fill={c}
                  />
                  <rect
                    width="1"
                    height={stroke}
                    transform="translate(0,0)"
                    fill={
                      !lightHatchColors.includes(c.toLowerCase())
                        ? "#333333"
                        : "#878787"
                    }
                  />
                </pattern>
              ))}
            </g>
          </defs>
        </svg>
      }
    </div>
  );
};

export default D3Map;
