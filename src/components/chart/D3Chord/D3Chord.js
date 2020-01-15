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

    // Define margins
    this.margin = {};

    // Initialize chart
    this.init();

    // Draw map
    this.draw();

    // // Set map as loaded
    // params.setMapLoaded(true);
  }

  exampleInstanceMethod(data) {}

  draw() {
    console.log("\nDrawing chord.");

    // Create test data
    const testData = [
      {
        source: "US",
        target: "NG",
        disbursed_funds: 500
      },
      {
        source: "NG",
        target: "US",
        disbursed_funds: 250
      }
    ];

    // Create matrix

    const n = [
      ...new Set(
        testData.map(d => {
          return {
            id: d.source,
            type: "source"
          };
        })
      )
    ];
    console.log(n);

    const indices = new Map();
    let nodeCount = 0;
    testData.forEach(d => {
      if (!indices.has(`${d.source} - source`)) {
        indices.set(`${d.source} - source`, nodeCount);
        nodeCount++;
      }
      if (!indices.has(`${d.target} - target`)) {
        indices.set(`${d.target} - target`, nodeCount);
        nodeCount++;
      }
    });
    console.log("indices");
    console.log(indices);
    const nArcsMax = indices.size;
    const testMatrix = [...Array(nArcsMax)].map(e => Array(nArcsMax));
    for (let i = 0; i < nArcsMax; i++) {
      for (let j = 0; j < nArcsMax; j++) {
        testMatrix[i][j] = 0;
      }
    }
    const nodeTypes = ["source", "target"];
    let incIdx = 0;
    let sourceIdx, targetIdx;
    const curIdx = {
      source: undefined,
      target: undefined
    };
    const valueField = "disbursed_funds";
    testData.forEach(d => {
      // If source or target new, add it to the map. Otherwise, retrieve it
      // from the map.
      nodeTypes.forEach(type => {
        curIdx[type] = indices.get(`${d[type]} - ${type}`);
      });

      // Populate matrix entries.
      testMatrix[curIdx.source][curIdx.target] = d[valueField];
      testMatrix[curIdx.target][curIdx.source] = d[valueField];
    });

    console.log("indices");
    console.log(indices);

    console.log("testMatrix");
    console.log(testMatrix);
    // create the svg area
    const svg = this.svg
      .attr("width", 440)
      .attr("height", 440)
      .append("g")
      .attr("transform", "translate(220,220)");

    // create a matrix
    // Flow between each entity, a square matrix.
    const matrix = [[0, 20, 0, 0], [20, 0, 0, 0], [0, 0, 0, 40], [0, 0, 40, 0]];

    // 4 groups, so create a vector of 4 colors
    const colors = ["#440154ff", "#31668dff", "#37b578ff", "#fde725ff"];

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    const res = d3
      .chord()
      .padAngle(0.05)
      // .sortSubgroups(d3.descending)(matrix);
      .sortSubgroups(d3.descending)(testMatrix);

    console.log("res");
    console.log(res);

    // add the groups on the outer part of the circle
    svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data(function(d) {
        return d.groups;
      })
      .enter()
      .append("g")
      .append("path")
      .style("fill", function(d, i) {
        return colors[i];
      })
      .style("stroke", "black")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(200)
          .outerRadius(210)
      );

    // Add the links between groups
    svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data(function(d) {
        return d;
      })
      .enter()
      .append("path")
      .attr("d", d3.ribbon().radius(200))
      .style("fill", function(d) {
        return colors[d.source.index];
      }) // colors depend on the source group. Change to target otherwise.
      .style("stroke", "black");
  }
}
export default D3Chord;
