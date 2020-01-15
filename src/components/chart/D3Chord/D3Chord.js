import * as d3 from "d3/dist/d3.min";
import Chart from "../../chart/Chart.js";
// import Util from "../misc/Util.js";
import styles from "./d3chord.module.scss";

/**
 * Creates a D3.js world map in the container provided
 * @param {String} selector A selector of the container element the map will be placed in
 * @return {Object} An object containing the map and the layer containing drawn items
 */
class D3Chord extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Define data
    this.params = params;

    // Define margins
    this.margin = {};

    // Initialize chart
    this.init();

    // Set dimensions
    this.width = this.containerwidth;
    this.height = this.containerheight;

    // Draw map
    this.draw();

    // // Set map as loaded
    // params.setMapLoaded(true);
  }

  exampleInstanceMethod(data) {}

  draw() {
    // radius
    const radius = this.params.radius || 300;

    // Define color scale.
    const red = "#67001f";
    const blue = "#053061";
    const color = d3
      .scaleLinear()
      .range([red, blue])
      .domain([0, 1]);

    // Get data for entity arcs, then subregion, then region
    const innerRadiusRegion = this.height * 0.35;
    const outerRadiusRegion = this.height * 0.4;

    const regionArcGenerator = d3
      .arc()
      .innerRadius(radius + 28)
      .outerRadius(radius + 28 + 12)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2);
    const subregionArcGenerator = d3
      .arc()
      .innerRadius(radius + 14)
      .outerRadius(radius + 14 + 12)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2);
    const entityArcGenerator = d3
      .arc()
      .innerRadius(radius)
      .outerRadius(radius + 12)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2);

    const padding = 0;

    // Determine sizes and start/end positions of region arcs (A-Z) based on
    // share of total pie.
    const flowTypeName = "disbursed_funds";
    const regionTotals = {};
    let total = 0;
    this.params.data.forEach(d => {
      if (d.flow_types[flowTypeName] === undefined) return;
      else {
        const weight = d.flow_types[flowTypeName].focus_node_weight;
        // source
        const types = [["source", "target"], ["target", "source"]];
        types.forEach(type => {
          const focusRegion = d[type[0]][0].region || "Other";
          if (regionTotals[focusRegion] === undefined) {
            regionTotals[focusRegion] = {
              [type[0]]: weight,
              [type[1]]: 0,
              total: weight,
              subregions: {}
            };
          } else {
            regionTotals[focusRegion][type[0]] += weight;
            regionTotals[focusRegion].total += weight;
          }
          total += weight;

          // Now check focus subregion
          const focusSubregion = d[type[0]][0].subregion || "Other";
          if (
            regionTotals[focusRegion].subregions[focusSubregion] === undefined
          ) {
            regionTotals[focusRegion].subregions[focusSubregion] = {
              [type[0]]: weight,
              [type[1]]: 0,
              total: weight,
              entities: {}
            };
          } else {
            regionTotals[focusRegion].subregions[focusSubregion][
              type[0]
            ] += weight;
            regionTotals[focusRegion].subregions[
              focusSubregion
            ].total += weight;
          }

          // Now check focus entity
          const focusEntity = d[type[0]][0].name || "Other";
          if (
            regionTotals[focusRegion].subregions[focusSubregion].entities[
              focusEntity
            ] === undefined
          ) {
            regionTotals[focusRegion].subregions[focusSubregion].entities[
              focusEntity
            ] = {
              [type[0]]: weight,
              [type[1]]: 0,
              total: weight,
              data: d[type[0]][0],
              remainingFlowThetaFraction: 1,
              flows: {
                target: [],
                source: []
              }
            };
          } else {
            regionTotals[focusRegion].subregions[focusSubregion].entities[
              focusEntity
            ][type[0]] += weight;
            regionTotals[focusRegion].subregions[focusSubregion].entities[
              focusEntity
            ].total += weight;
          }
          regionTotals[focusRegion].subregions[focusSubregion].entities[
            focusEntity
          ].flows[type[0]].push(d);
        });
      }
    });

    console.log("regionTotals");
    console.log(regionTotals);
    // Get region data for arc drawing.
    const arcsData = {
      region: [],
      subregion: [],
      entity: [],
      flow: []
    };

    // Compute arc region sizes.
    const currentTheta1 = {
      region: 0,
      subregion: 0,
      entity: 0,
      flow: 0
    };
    const thetaChunk = {
      region: 2 * Math.PI,
      subregion: undefined,
      entity: undefined,
      flow: undefined
    };
    for (let key in regionTotals) {
      const region = regionTotals[key];
      region.theta1 = currentTheta1.region + padding / 2;
      region.theta2 =
        thetaChunk.region * (region.total / total) +
        region.theta1 -
        padding / 2;
      region.color = color(region.source / region.total);

      arcsData.region.push({
        ...region,
        name: key
      });

      // Process subregions
      currentTheta1.subregion = currentTheta1.region;
      thetaChunk.subregion = region.theta2 - region.theta1;
      for (let focusSubregion in region.subregions) {
        const subregion = regionTotals[key].subregions[focusSubregion];
        subregion.theta1 = currentTheta1.subregion + padding / 2;
        subregion.theta2 =
          thetaChunk.subregion * (subregion.total / region.total) +
          subregion.theta1;
        subregion.color = color(subregion.source / subregion.total);

        arcsData.subregion.push({
          ...subregion,
          name: focusSubregion
        });

        // Process entities
        currentTheta1.entity = currentTheta1.subregion;
        thetaChunk.entity = subregion.theta2 - subregion.theta1;
        for (let focusEntity in subregion.entities) {
          const entity = subregion.entities[focusEntity];
          entity.theta1 = currentTheta1.entity;
          entity.theta2 =
            thetaChunk.entity * (entity.total / subregion.total) +
            entity.theta1;
          entity.color = color(entity.source / entity.total);
          currentTheta1.entity = entity.theta2;

          arcsData.entity.push({
            ...entity,
            name: entity.data.name
          });
          currentTheta1.entity = entity.theta2;
        }
        currentTheta1.subregion = subregion.theta2;
      }
      currentTheta1.region = region.theta2;
    }

    console.log("arcsData");
    console.log(arcsData);

    this.chart.attr(
      "transform",
      `translate(${this.width / 2},${this.height / 2})`
    );

    const arcTypes = [
      {
        name: "regionArcs",
        type: "region",
        generator: regionArcGenerator
      },
      {
        name: "subregionArcs",
        type: "subregion",
        generator: subregionArcGenerator
      },
      {
        name: "entityArcs",
        type: "entity",
        generator: entityArcGenerator
      }
    ];
    arcTypes.forEach(arcType => {
      arcTypes.type = this.chart
        .append("g")
        .attr("class", styles[arcType.type])
        .selectAll("path")
        .data(arcsData[arcType.type])
        .enter()
        .append("path")
        .attr("class", styles[arcType.type])
        .style("fill", d => d.color)
        .attr("d", d => arcType.generator(d))
        .on("click", d => {
          this.params.setSelectedEntity(d.name);
        });
    });

    // Define flows
    const ribbon = d3
      .ribbon()
      .source(d => d.source)
      .target(d => d.target)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2)
      .radius(radius);

    const flows = [];

    // Process flows between entities.
    arcsData.entity.forEach(d => {
      if (d.flows.source.length === 0) return;

      // For each flow
      d.flows.source.forEach(f => {
        const weight = f.flow_types[flowTypeName].focus_node_weight;
        const info = {
          source: {
            region: f.source[0].region || "Other",
            subregion: f.source[0].subregion || "Other",
            entity: f.source[0].name || "Other"
          },
          target: {
            region: f.target[0].region || "Other",
            subregion: f.target[0].subregion || "Other",
            entity: f.target[0].name || "Other"
          }
        };
        const source =
          regionTotals[info.source.region].subregions[info.source.subregion]
            .entities[info.source.entity];
        const target =
          regionTotals[info.target.region].subregions[info.target.subregion]
            .entities[info.target.entity];

        // Flow theta1 is equal to target theta2 minus the remaining chunk
        const totalTheta = target.theta2 - target.theta1;

        const thetaChunkRemaining =
          target.remainingFlowThetaFraction * (target.theta2 - target.theta1);

        const thetaChunkOccupied = totalTheta - thetaChunkRemaining;

        const thetaChunk = thetaChunkRemaining * (weight / target.total);

        // Theta 1, theta 2 for target
        const theta1 = target.theta1 + thetaChunkOccupied;
        const theta2 = target.theta1 + thetaChunkOccupied + thetaChunk;

        const used = (thetaChunkOccupied + thetaChunk) / totalTheta;
        target.remainingFlowThetaFraction = 1 - used;

        const sourceTotalTheta = source.theta2 - source.theta1;
        const sourceThetaChunkRemaining =
          source.remainingFlowThetaFraction * sourceTotalTheta;
        const sourceThetaChunkOccupied =
          sourceTotalTheta - sourceThetaChunkRemaining;

        const sourceThetaChunk = sourceTotalTheta * (weight / source.total);

        const sourceTheta1 = source.theta1 + sourceThetaChunkOccupied;
        const sourceTheta2 =
          source.theta1 + sourceThetaChunkOccupied + sourceThetaChunk;

        const sourceUsed =
          (sourceThetaChunkOccupied + sourceThetaChunk) / sourceTotalTheta;
        source.remainingFlowThetaFraction = 1 - sourceUsed;

        flows.push({
          source: {
            theta1: sourceTheta1,
            theta2: sourceTheta2
          },
          target: {
            theta1: theta1,
            theta2: theta2
          },
          weight: weight
        });
      });
    });

    // this.params.data.forEach(d => {
    //   if (d.flow_types[flowTypeName] === undefined) return;
    //   const info = {
    //     source: {
    //       region: d.source[0].region || "Other",
    //       subregion: d.source[0].subregion || "Other",
    //       entity: d.source[0].name || "Other"
    //     },
    //     target: {
    //       region: d.target[0].region || "Other",
    //       subregion: d.target[0].subregion || "Other",
    //       entity: d.target[0].name || "Other"
    //     }
    //   };
    //   flows.push({
    //     weight: d.flow_types[flowTypeName].focus_node_weight,
    //     source:
    //       regionTotals[info.source.region].subregions[info.source.subregion]
    //         .entities[info.source.entity],
    //     target:
    //       regionTotals[info.target.region].subregions[info.target.subregion]
    //         .entities[info.target.entity]
    //   });
    // });
    flows.sort((a, b) => {
      return d3.ascending(a.weight, b.weight);
    });

    this.chart
      .append("g")
      .attr("class", styles.flows)
      .selectAll("." + styles.flow)
      .data(flows)
      .enter()
      .append("path")
      .attr("class", styles.flow)
      .attr("d", d => ribbon(d));
  }
}
export default D3Chord;
