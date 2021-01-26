import React from "react";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3/dist/d3.min";
import * as sankey from "d3-sankey/dist/d3-sankey.js";
import Chart from "../../../../chart/Chart.js";
import Util, { formatRegion } from "../../../../misc/Util.js";
import styles from "../sankey.module.scss";

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
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };

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
    return pathStr;
  }

  draw() {
    // Initialize some constants
    // Params object
    const params = this.params;
    const roleToNoun = {
      origin: "Funder",
      target: "Recipient",
    };
    function updateTooltip(d) {
      const tooltipData = [
        {
          field: params.xLabel,
          value: Util.money(d.value),
        },
      ];
      if (d.role !== undefined) {
        tooltipData.unshift({
          field: roleToNoun[d.role],
          value: d.name,
        });
      } else if (d.source !== undefined) {
        tooltipData.unshift({
          field: "Recipient",
          value: d.target.name,
        });
        tooltipData.unshift({
          field: "Funder",
          value: d.source.name,
        });
      }
      params.setTooltipData(tooltipData);
    }

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

    const sortFlag = params.sortDesc ? -1 : 1;
    const skipSort = d => {
      if (d.role !== undefined) {
      }
      if (params.sortFunder === true) {
        return d.role === "target";
      } else if (params.sortFunder === false) {
        return d.role === "origin";
      } else {
        return false;
      }
    };

    const sortByValue = (a, b) => {
      if (skipSort(a)) return 0;
      else if (skipSort(b)) return 0;
      else if (a.value > b.value) return sortFlag;
      else if (a.value < b.value) return -1 * sortFlag;
      else return 0;
    };

    const sortedSide = params.sortFunder === true ? "origin" : "target";

    // TODO manage left and right margins dynamically based on label sizes
    const generator = sankey
      .sankey()
      .size([width, height])
      .linkSort(sortByValue)
      .nodeSort(sortByValue)
      .nodeId(nodeId)
      .nodeWidth(10)
      .nodePadding(1)
      .nodes(graph.nodes)
      .links(graph.links);

    // assign node and link properties
    generator();

    // apply `max` to nodes and regenerate node and link properties -- only
    // keep the top [`max`] nodes on the sorted side of the diagram, and only
    // the nodes they are linked to on the unsorted side
    const dir = params.sortFunder ? "source" : "target";
    const topSortedNodes = graph.nodes.filter(d => d.role === sortedSide);
    const otherSideNodes = graph.nodes.filter(d => d.role !== sortedSide);
    topSortedNodes.sort(sortByValue);
    graph.nodes = topSortedNodes.slice(0, params.max).concat(otherSideNodes);
    const topSortedNodesIdx = graph.nodes.map(d => d.index);
    graph.links = graph.links.filter(d =>
      topSortedNodesIdx.includes(d[dir].index)
    );
    generator.nodes(graph.nodes).links(graph.links);
    generator();

    // define constants used in highlight/unhighlight behavior
    const otherDir = dir === "target" ? "source" : "target";
    const linkKey = dir + "Links";
    const otherLinkKey = otherDir + "Links";
    const unhighlight = () => {
      chart.selectAll("rect, path").classed(styles.highlighted, false);
    };

    // render links
    chart
      .append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .on("mouseover", updateTooltip)
      .on("mouseleave", unhighlight)
      .on("mouseenter", function highlightOnLinkEnter(d) {
        const highlightIndicesLinks = [
          d.index, // TODO other links
        ];

        // if sorting by funder, highlight other links from this origin,
        // otherwise highlight other links from this target
        const otherLinks = d[dir][linkKey];
        otherLinks
          .map(dd => dd.index)
          .forEach(id => highlightIndicesLinks.push(id));

        const highlightIndicesNodes = [d[dir].index];
        otherLinks
          .map(dd => dd[otherDir].index)
          .forEach(id => highlightIndicesNodes.push(id));

        chart
          .selectAll("rect")
          .filter(d => {
            return highlightIndicesNodes.includes(d.index); // TODO check slow?
          })
          .classed(styles.highlighted, true);
        chart
          .selectAll("path")
          .filter(d => {
            return highlightIndicesLinks.includes(d.index); // TODO check slow?
          })
          .classed(styles.highlighted, true);
      })
      .attr("data-tip", true)
      .attr("data-for", "sankeyTooltip")
      .attr("d", this.sankeyLinkPath)
      .attr("data-index", d => d.index)
      .attr("stroke-width", function(d) {
        return d.width;
      });

    // render nodes
    chart
      .append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .on("mouseover", updateTooltip)
      .attr("data-tip", true)
      .attr("data-for", "sankeyTooltip")
      .attr("data-index", d => d.index)
      .on("mouseleave", unhighlight)
      .on("mouseenter", function highlightOnNodeEnter(d) {
        const isSortedSide =
          (d.role === "origin" && params.sortFunder === true) ||
          (d.role === "target" && params.sortFunder === false);

        const highlightIndicesNodes = [
          d.index, // TODO other nodes
        ];
        const highlightIndicesLinks = [
          ...d.sourceLinks.map(dd => dd.index),
          ...d.targetLinks.map(dd => dd.index),
        ];

        // add nodes on other "side" connected to links
        d[isSortedSide ? linkKey : otherLinkKey]
          .map(d => d[isSortedSide ? otherDir : dir].index)
          .forEach(id => highlightIndicesNodes.push(id));
        chart
          .selectAll("rect")
          .filter(d => {
            return highlightIndicesNodes.includes(d.index); // TODO check slow?
          })
          .classed(styles.highlighted, true);
        chart
          .selectAll("path")
          .filter(d => {
            return highlightIndicesLinks.includes(d.index); // TODO check slow?
          })
          .classed(styles.highlighted, true);
      })
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("transform", function(d) {
        return "translate(" + d.x0 + "," + d.y0 + ")";
      });
    ReactTooltip.rebuild();
  }
}
export default D3Sankey;
