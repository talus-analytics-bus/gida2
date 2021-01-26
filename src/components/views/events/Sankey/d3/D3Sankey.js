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
  sankeyLinkPath(link) {
    const offset = 0; // CHECK
    // https://observablehq.com/@enjalot/weird-sankey-links
    // this is a drop in replacement for d3.sankeyLinkHorizontal()
    let sx = link.source.x1;
    let tx = link.target.x0 + 1;
    let sy0 = link.y0 - link.width / 2;
    let sy1 = link.y0 + link.width / 2;
    let ty0 = link.y1 - link.width / 2;
    let ty1 = link.y1 + link.width / 2;

    let halfx = (tx - sx) / 2;

    let path = d3.path();
    path.moveTo(sx, sy0);

    let cpx1 = sx + halfx;
    let cpy1 = sy0 + offset;
    let cpx2 = sx + halfx;
    let cpy2 = ty0 - offset;
    path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0);
    path.lineTo(tx, ty1);

    cpx1 = sx + halfx;
    cpy1 = ty1 - offset;
    cpx2 = sx + halfx;
    cpy2 = sy1 + offset;
    path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1);
    path.lineTo(sx, sy0);
    const pathStr = path.toString();
    // if (pathStr.includes("NaN")) {
    //   console.log("link - NaN inside");
    //   console.log(link);
    // }
    return pathStr;
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
        console.log(a);
        if (a.value > b.value) return -1;
        else if (a.value < b.value) return 1;
        else return 0;
      })
      .nodeSort(function linksByValue(a, b) {
        console.log(a);
        if (a.value > b.value) return -1;
        else if (a.value < b.value) return 1;
        else return 0;
      })
      .nodeId(nodeId)
      .nodeWidth(10)
      .nodePadding(1)
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
      .attr("d", this.sankeyLinkPath)
      // .attr("d", sankey.sankeyLinkHorizontal())
      .attr("stroke-width", function(d) {
        return d.width;
      });

    // render nodes
    chart
      .append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .attr("title", d => {
        // console.log(d);
        return d.name;
      })
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("transform", function(d) {
        return "translate(" + d.x0 + "," + d.y0 + ")";
      });
    console.log("graph");
    console.log(graph);
  }
}
export default D3Sankey;
