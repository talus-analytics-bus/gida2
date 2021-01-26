import React from "react";
import * as d3 from "d3/dist/d3.min";
import * as sankey from "d3-sankey/dist/d3-sankey.js";
import Chart from "../../../../chart/Chart.js";
import Util, { formatRegion } from "../../../../misc/Util.js";
import styles from "./d3sankey.module.scss";
import ReactTooltip from "react-tooltip";

// // colors
// import {
//   outbreakBlue2,
//   outbreakBlue3,
//   outbreakBlue4,
//   outbreakBlue5,
// } from "../../../../../assets/styles/colors.scss";

class D3Sankey extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Define data
    this.params = params;

    // Define margins
    this.margin = {};

    // Set dimensions
    this.width = this.containerwidth;
    this.height = this.containerheight;
    this.margin = { top: 50, right: 70, bottom: 35, left: 0 };

    // Initialize chart
    this.init();

    // Draw chart
    this.draw();
  }

  draw() {
    // Initialize some constants
    // Params object
    const params = this.params;

    // define chart accessor
    const chart = this.chart.classed("sankey-chart", true);

    // define dimension accessors
    const margin = this.margin;
    const width = this.width;
    const height = this.height;

    const graph = params.data;

    const nodeId = function id(d) {
      return d.id;
    };

    // TODO manage left and right margins dynamically based on label sizes
    const generator = sankey
      .sankey()
      .size([width, height])
      .linkSort(function linksByValue(a, b) {
        if (a.value > b.value) return -1;
        else if (a.value < b.value) return 1;
        else return 0;
      })
      .nodeId(nodeId)
      .nodeWidth(10)
      .nodePadding(15)
      .nodes(graph.nodes)
      .links(graph.links);

    // assign node and link properties
    generator();

    // render links
    chart
      .append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", sankey.sankeyLinkHorizontal())
      .attr("stroke-width", function(d) {
        return d.width;
      });

    // render nodes
    chart
      .append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("transform", function(d) {
        return "translate(" + d.x0 + "," + d.y0 + ")";
      });
  }
}
export default D3Sankey;
