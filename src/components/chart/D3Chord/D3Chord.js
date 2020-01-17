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

    // Define padding between arcs
    this.arcPadding = params.arcPadding || 0.02;
    this.arcPaddingSub = params.arcPaddingSub || 0.01;

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
    const other = "Other funders / recipients";
    // radius
    const radius = this.containerheight * 0.4;

    // Define color scale.
    const red = "#67001f";
    const blue = "#053061";
    const color = d3
      .scaleLinear()
      .range([red, blue])
      .domain([0, 1]);

    // Get data for entity arcs, then subregion, then region
    const innerRadiusRegion = this.height * 0.35;
    const outerRadiusRegion = radius + 28 + 12;

    // const pie = d3.pie();
    // const innerRadius = outerRadius * padAngle / sin(θ);
    const padRadius = 20;
    const padAngle = 0.1;
    const regionArcGenerator = d3
      .arc()
      .innerRadius(radius + 28)
      .outerRadius(outerRadiusRegion)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2)
      .padRadius(padRadius)
      .padAngle(padAngle);
    const subregionArcGenerator = d3
      .arc()
      .innerRadius(radius + 14)
      .outerRadius(radius + 14 + 12)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2)
      .padRadius(padRadius)
      .padAngle(padAngle);
    const entityArcGenerator = d3
      .arc()
      .innerRadius(radius - 12)
      .outerRadius(radius + 12)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2)
      .padRadius(padRadius)
      .padAngle(padAngle);

    const padding = 0;

    // Determine sizes and start/end positions of region arcs (A-Z) based on
    // share of total pie.
    const flowTypeName = this.params.transactionType + "_funds";
    this.params.chordData = this.params.chordData
      .filter(
        d =>
          d.flow_types[flowTypeName] !== undefined &&
          d.source.length === 1 &&
          d.target.length === 1
      )
      .sort((a, b) => {
        return d3.ascending(
          a.target[0].region || other,
          b.target[0].region || other
        );
      });

    const regionTotals = {};
    let total = 0;
    this.params.chordData.forEach(d => {
      const weight = d.flow_types[flowTypeName].focus_node_weight;
      // source
      const types = [["target", "source"], ["source", "target"]];
      types.forEach(type => {
        const focusRegion = d[type[0]][0].region || other;
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
        const focusSubregion = d[type[0]][0].subregion || other;
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
          regionTotals[focusRegion].subregions[focusSubregion].total += weight;
        }

        // Now check focus entity
        const focusEntity = d[type[0]][0].name || other;
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
              source: [],
              all: []
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
        regionTotals[focusRegion].subregions[focusSubregion].entities[
          focusEntity
        ].flows.all.push(d);
      });
    });

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
      region.theta1 = currentTheta1.region;
      region.theta2 =
        thetaChunk.region * (region.total / total) + region.theta1;
      region.color = color(region.source / region.total);

      // Process subregions
      currentTheta1.subregion = currentTheta1.region;
      const nSubregions = Object.values(region.subregions).length;
      thetaChunk.subregion = region.theta2 - region.theta1;
      let nSubregion = 0;
      const subregionValues = Object.values(region.subregions);

      // For each subregion:
      for (let focusSubregion in region.subregions) {
        const subregion = regionTotals[key].subregions[focusSubregion];
        subregion.theta1 = currentTheta1.subregion;
        subregion.theta2 =
          thetaChunk.subregion * (subregion.total / region.total) +
          subregion.theta1;
        subregion.color = color(subregion.source / subregion.total);

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

        // subregion.theta1 += this.arcPadding;
        // subregion.theta2 += this.arcPadding;
        arcsData.subregion.push({
          ...subregion,
          name: focusSubregion
        });
        nSubregion++;
      }
      currentTheta1.region = region.theta2;

      arcsData.region.push({
        ...region,
        name: key
      });
    }

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

    const chart = this;
    const setSelectedEntity = d => {
      if (chart.params.selectedEntity === d.data.id) {
        chart.params.setSelectedEntity(null);
      } else chart.params.setSelectedEntity(d.data.id);
    };
    const offset = (arcsData.region[0].theta2 - arcsData.region[0].theta1) / 2;
    arcTypes.forEach(arcType => {
      arcsData[arcType.type].forEach(d => {
        d.theta1 -= offset;
        d.theta2 -= offset;
      });
    });

    this.highlight = id => {
      // Highlight selected entity
      d3.select("g." + styles.entity)
        .selectAll("path")
        .classed(styles.selected, false)
        .filter(function(d) {
          console.log("d");
          console.log(d);
          return d.data.id === id;
        })
        .classed(styles.selected, true)
        .raise();

      // Highlight relevant flows
      d3.select("." + styles.flows)
        .selectAll("path")
        .classed(styles.hidden, true)
        .filter(dd => {
          return dd.source_id === id || dd.target_id === id;
          return true;
        })
        .classed(styles.hidden, false);
    };
    this.unHighlight = () => {
      d3.select("." + styles.flows)
        .selectAll("path")
        .classed(styles.hidden, false);
      d3.select("g." + styles.entity)
        .selectAll("path")
        .classed(styles.selected, false);
    };

    // Define flows
    const ribbon = d3
      .ribbon()
      .source(d => d.source)
      .target(d => d.target)
      .startAngle(d => d.theta1)
      .endAngle(d => d.theta2)
      .radius(radius - 12);

    const flows = [];

    // Process flows between entities.
    arcsData.entity.forEach(d => {
      if (d.flows.source.length === 0) return;

      // For each flow
      d.flows.source.forEach(f => {
        const weight = f.flow_types[flowTypeName].focus_node_weight;
        const info = {
          source: {
            region: f.source[0].region || other,
            subregion: f.source[0].subregion || other,
            entity: f.source[0].name || other
          },
          target: {
            region: f.target[0].region || other,
            subregion: f.target[0].subregion || other,
            entity: f.target[0].name || other
          }
        };
        const source =
          regionTotals[info.source.region].subregions[info.source.subregion]
            .entities[info.source.entity];
        const target =
          regionTotals[info.target.region].subregions[info.target.subregion]
            .entities[info.target.entity];

        // Math for target
        const arcLengthT = target.theta2 - target.theta1;
        const fracArcLengthToUseT = weight / target.total;
        const fracArcLengthAlreadyUsedT = 1 - target.remainingFlowThetaFraction;
        const arcLengthToUseT = fracArcLengthToUseT * arcLengthT;
        const arcLengthAlreadyUsedT = fracArcLengthAlreadyUsedT * arcLengthT;
        const updatedArcLengthAlreadyUsedT =
          arcLengthToUseT + arcLengthAlreadyUsedT;
        const updatedFracArcLengthAlreadyUsedT =
          updatedArcLengthAlreadyUsedT / arcLengthT;

        // Math for source
        const arcLengthS = source.theta2 - source.theta1;
        const fracArcLengthToUseS = weight / source.total;
        const fracArcLengthAlreadyUsedS = 1 - source.remainingFlowThetaFraction;
        const arcLengthToUseS = fracArcLengthToUseS * arcLengthS;
        const arcLengthAlreadyUsedS = fracArcLengthAlreadyUsedS * arcLengthS;
        const updatedArcLengthAlreadyUsedS =
          arcLengthToUseS + arcLengthAlreadyUsedS;
        const updatedFracArcLengthAlreadyUsedS =
          updatedArcLengthAlreadyUsedS / arcLengthS;

        // Math for source flow thetas
        const flowThetas = {
          source_id: source.data.id,
          target_id: target.data.id,
          source: {},
          target: {},
          weight: weight
        };

        // Source: Go from original theta 1 plus already used...
        // ...to original theta 1 plus updated already used.
        flowThetas.source.theta1 =
          source.theta1 + arcLengthAlreadyUsedS - offset;
        flowThetas.source.theta2 =
          source.theta1 + updatedArcLengthAlreadyUsedS - offset;
        source.remainingFlowThetaFraction =
          1 - updatedFracArcLengthAlreadyUsedS;

        // Same for target
        flowThetas.target.theta1 =
          target.theta1 + arcLengthAlreadyUsedT - offset;
        flowThetas.target.theta2 =
          target.theta1 + updatedArcLengthAlreadyUsedT - offset;
        target.remainingFlowThetaFraction =
          1 - updatedFracArcLengthAlreadyUsedT;

        // Add flow path data
        flows.push(flowThetas);
      });
    });

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

    arcTypes.forEach(arcType => {
      arcTypes[arcType.type] = this.chart
        .append("g")
        .attr("class", styles[arcType.type])
        .selectAll("path")
        .data(arcsData[arcType.type])
        .enter()
        .append("path")
        .attr("class", styles[arcType.type])
        .style("fill", d => d.color)
        .attr("d", d => arcType.generator(d))
        .on("click", arcType.type === "entity" ? setSelectedEntity : undefined);
    });

    // Add labels
    // Create text circle.
    const circleGen = () => {
      const radius = outerRadiusRegion;

      //set defaults
      var r = function(d) {
          return d.radius;
        },
        x = function(d) {
          return d.x;
        },
        y = function(d) {
          return d.y;
        };

      //returned function to generate circle path
      function circle(d) {
        var cx = 0,
          cy = 0,
          myr = radius;

        return (
          "M" +
          cx +
          " " +
          cy +
          " " +
          "m" +
          " 0 " +
          myr +
          "a" +
          myr +
          " " +
          myr +
          " 0 0 1 " +
          " 0 " +
          -myr * 2 +
          "a" +
          myr +
          " " +
          myr +
          " 0 0 1 " +
          " 0 " +
          myr * 2 +
          "Z"
        );
      }

      //getter-setter methods
      circle.r = function(value) {
        if (!arguments.length) return r;
        r = value;
        return circle;
      };
      circle.x = function(value) {
        if (!arguments.length) return x;
        x = value;
        return circle;
      };
      circle.y = function(value) {
        if (!arguments.length) return y;
        y = value;
        return circle;
      };

      return circle;
    };
    const textCircle = circleGen()
      .x(function(d) {
        return 0;
      })
      .y(function(d) {
        return 0;
      })
      .r(function(d) {
        return outerRadiusRegion;
      });

    // Add region labels.
    this.chart
      .append("g")
      .append("path")
      .attr("class", styles.textCircle)
      .attr("id", "textCircle")
      .attr("d", textCircle);

    this.chart
      .append("g")
      .append("path")
      .attr("class", styles.textCircleRev)
      .attr("id", "textCircleRev")
      .attr("d", textCircle)
      .attr("transform", "scale(-1, 1)");
    arcsData.region.forEach(d => {
      d.center = d.theta1 + (d.theta2 - d.theta1) / 2;
      d.needToFlip = d.center > Math.PI / 2 && d.center < (3 * Math.PI) / 2;
    });
    this.chart
      .selectAll("text")
      .data(arcsData.region)
      .enter()
      .append("text")
      .attr("class", styles.regionLabel)
      .attr(
        "transform",
        d => `rotate(180)rotate(${-180 + (360 * d.center) / (2 * Math.PI)})`
      )
      .attr("dy", d => (d.needToFlip ? "1em" : -5))
      .style("text-anchor", "middle")
      .append("textPath")
      .attr("href", d => (d.needToFlip ? "#textCircleRev" : "#textCircle"))
      .attr("startOffset", d => {
        return "50%";
        // if (d.needToFlip) {
        //   return `${100 - (100 * d.center) / (2 * Math.PI)}%`;
        // } else {
        //   return `${(100 * d.center) / (2 * Math.PI)}%`;
        // }
      })
      // .attr("startOffset", d => {
      //   if (d.needToFlip) {
      //     return `${100 - (100 * d.center) / (2 * Math.PI)}%`;
      //   } else {
      //     return `${(100 * d.center) / (2 * Math.PI)}%`;
      //   }
      // })
      .text(d => d.name);
  }
}
export default D3Chord;
