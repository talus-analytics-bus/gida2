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

    // Draw map
    this.drawViz();

    // // Set map as loaded
    // params.setMapLoaded(true);
  }

  exampleInstanceMethod(data) {}

  drawViz() {
    const chart = this;
    var chord = window.viz
      .chord()
      .data(getData(chart))
      .source(function(d) {
        return d[1];
      })
      .target(function(d) {
        return d[0];
      })
      .value(function(d) {
        return d[2];
      })
      .innerRadius(120)
      .outerRadius(130);

    // Build middle ring for subregion
    const chordSubRegion = window.viz
      .chord()
      .data(getData(chart))
      .source(function(d) {
        return d[1];
      })
      .target(function(d) {
        return d[0];
      })
      .value(function(d) {
        return d[2];
      })
      .label(() => "")
      .innerRadius(120 + 15)
      .outerRadius(130 + 15);

    // Build outer ring for region
    const chordRegion = window.viz
      .chord()
      .data(getData(chart))
      .source(function(d) {
        return d[1];
      })
      .target(function(d) {
        return d[0];
      })
      .value(function(d) {
        return d[2];
      })
      .innerRadius(120 + 30)
      .outerRadius(130 + 30);

    const chordGroups = this.svg.select("g");
    chordGroups
      .append("g")
      .attr("class", "chord-entity")
      .attr("transform", "translate(220,220)")
      .call(chord);

    // Draw second chord diagram for regions
    chordGroups
      .append("g")
      .attr("class", "chord-subregion")
      .attr("transform", "translate(220,220)")
      .call(chordSubRegion);

    // Draw third chord diagram for regions
    chordGroups
      .append("g")
      .attr("class", "chord-region")
      .attr("transform", "translate(220,220)")
      .call(chordRegion);

    // Stop default mouseover event on hovering.
    // this.svg
    //   .select(".viz-chord-labels")
    //   .selectAll("text")
    //   .style("display", "none");

    this.svg.selectAll("*").on("mouseover", null);
    this.svg
      .select(".viz-chord-groups")
      .selectAll("path")
      .on("mouseover", function(d) {
        console.log(d);
      });

    // Check what data are bound to each chord
    console.log(
      this.svg
        .select(".viz-chord-groups")
        .selectAll("path")
        .data()
    );
    console.log(
      this.svg
        .select(".viz-chord-labels")
        .selectAll("text")
        .data()
    );

    function getData(chart) {
      const dataOut = [];
      chart.params.data.forEach(d => {
        if (d.flow_types.disbursed_funds === undefined) return;
        dataOut.push([
          d.source[0].name,
          d.target[0].name,
          d.flow_types.disbursed_funds.focus_node_weight
        ]);
      });
      console.log(dataOut);
      return dataOut;
      return [
        ["US", "Canada", 343000],
        ["US", "China", 27000],
        ["US", "India", 3000],
        ["US", "UK", 212000],
        ["Canada", "China", 9000],
        ["Canada", "India", 2000],
        ["Canada", "UK", 86000],
        ["Canada", "US", 842000],
        ["UK", "Canada", 607000],
        ["UK", "China", 9000],
        ["UK", "India", 5000],
        ["UK", "US", 715000],
        ["China", "Canada", 711000],
        ["China", "India", 7000],
        ["China", "UK", 183000],
        ["China", "US", 2104000],
        ["India", "Canada", 621000],
        ["India", "China", 9000],
        ["India", "UK", 777000],
        ["India", "US", 1969000]
      ];
    }
  }

  drawChord() {
    console.log("\nDrawing chord.");

    // Create test data
    const testData = [
      {
        source: [
          {
            id: 239,
            name: "US",
            region: "Americas",
            subregion: "North America"
          }
        ],
        target: [
          {
            id: 100,
            name: "NG",
            region: "Africa",
            subregion: "West Africa"
          }
        ],
        disbursed_funds: 500
      },
      {
        source: [
          {
            id: 999,
            name: "CA",
            region: "Americas",
            subregion: "North America"
          }
        ],
        target: [
          {
            id: 100,
            name: "NG",
            region: "Africa",
            subregion: "West Africa"
          }
        ],
        disbursed_funds: 100
      },
      {
        source: [
          {
            id: 100,
            name: "NG",
            region: "Africa",
            subregion: "West Africa"
          }
        ],
        target: [
          {
            id: 239,
            name: "US",
            region: "Americas",
            subregion: "North America"
          }
        ],
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
      // Source and target indices
      if (!indices.has(`${d.source[0].id} - source`)) {
        indices.set(`${d.source[0].id} - source`, {
          idx: nodeCount,
          data: d.source[0]
        });
        nodeCount++;
      }
      if (!indices.has(`${d.target[0].id} - target`)) {
        indices.set(`${d.target[0].id} - target`, {
          idx: nodeCount,
          data: d.target[0]
        });
        nodeCount++;
      }

      // Region and subregion indices.
      // TODO
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
        curIdx[type] = indices.get(`${d[type][0].id} - ${type}`).idx;
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
    const nodeData = [...indices.values()];
    let i = 0;
    const res = d3
      .chord()
      .padAngle(0.05)
      // .sortSubgroups(d3.descending)(matrix);
      .sortGroups(function(d) {
        console.log("nodeData[i].data");
        console.log(nodeData[i].data);
        i++;
        return nodeData[i].data.id;
      })(testMatrix);

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
        if (nodeData[i].data.name === "US") return "lightgreen";
        else if (nodeData[i].data.name === "CA") return "pink";
        else return "lightblue";
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
      .style("fill", function(d, i) {
        console.log("d");
        console.log(d);
        if (nodeData[d.source.subindex].data.name === "US") return "lightgreen";
        else if (nodeData[d.source.subindex].data.name === "CA") return "pink";
        else return "lightblue";
        // return colors[d.source.index];
      }) // colors depend on the source group. Change to target otherwise.
      .style("stroke", "black");
  }
}
export default D3Chord;
