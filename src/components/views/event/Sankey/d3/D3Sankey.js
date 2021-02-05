import React from "react";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3/dist/d3.min";
import * as sankey from "d3-sankey/dist/d3-sankey.js";
import Chart from "../../../../chart/Chart.js";
import Util, { formatRegion } from "../../../../misc/Util.js";
import styles from "../sankey.module.scss";

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
    this.margin = { top: 25, right: 0, bottom: 0, left: 0 };

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
  getShortName(s, maxLen = 20) {
    if (s === "General IHR") return s;
    if (s.length > maxLen) {
      const words = s.split(" ");
      let curShortened = "";
      let i = 0;
      while (
        i < words.length - 1 &&
        (curShortened + " " + words[i]).length < maxLen
      ) {
        curShortened += " " + words[i];
        i++;
      }
      return curShortened === s ? s : `${curShortened}...`;
    } else {
      return s;
    }
  }

  getName(s) {
    return s;
  }

  draw() {
    const getChartMargin = (names, fmt = v => v, padding = 0) => {
      const fakeText = chart
        .selectAll(".fake-text")
        .data(names)
        .enter()
        .append("text")
        .text(d => fmt(d))
        .attr("class", [styles.tick, styles.fakeText].join(" "));
      const maxLabelWidth = d3.max(fakeText.nodes(), d => d.getBBox().width);
      fakeText.remove();
      return maxLabelWidth + padding;
    };

    const getBelowMinNodeHeight = d => {
      const nodeHeight = d.y1 - d.y0;
      return nodeHeight < 30;
    };

    // Initialize some constants
    // Params object
    const params = this.params;
    const roleToNoun = {
      origin: "Funder",
      target: "Recipient",
    };
    function getIsLink(d) {
      return d.name !== "Not reported" && d.subcat !== "region";
    }
    function updateTooltip(d, isLabel = false) {
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
        if (isLabel) tooltipData.footer = "Click to go to details page";
        else tooltipData.footer = "Click to pin/unpin highlights";
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

    // if no data, return
    if (graph.nodes.length === 0) return;

    const nodeId = function id(d) {
      return d.nodeId;
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
      if (a.value > b.value) return sortFlag;
      else if (a.value < b.value) return -1 * sortFlag;
      else return 0;
    };

    const sortByIhr = (a, b) => {
      if (a.name > b.name) return 1;
      else if (a.name < b.name) return -1;
      else return 0;
    };

    const sortByValueOrIhr = (a, b) => {
      if (a.type === "ihr" && b.type === "ihr") return sortByValue(a, b);
      else return sortByValue(a, b);
    };

    const sortedSide = params.sortFunder === true ? "origin" : "target";

    // TODO manage left and right margins dynamically based on label sizes
    const generator = sankey
      .sankey()
      .size([width, height])
      .linkSort(sortByValueOrIhr)
      .nodeSort(sortByValueOrIhr)
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
    const dir = "source";
    const topSortedNodes = graph.nodes.filter(d => d.role === sortedSide);
    const otherSideNodes = graph.nodes.filter(d => d.type === "ihr");
    topSortedNodes.sort(sortByValue);
    graph.nodes = topSortedNodes.slice(0, params.max).concat(otherSideNodes);
    const topSortedNodesIdx = graph.nodes.map(d => d.index);
    graph.links = graph.links.filter(d =>
      topSortedNodesIdx.includes(d[dir].index)
    );
    generator.nodes(graph.nodes).links(graph.links);
    generator();

    // const labeledNodes = graph.nodes;
    const labeledNodes = graph.nodes;
    // const labeledNodes = graph.nodes.filter(d => !getBelowMinNodeHeight(d));
    const maxLenGlobal = Infinity;
    // const maxLenGlobal = 20;
    const maxLenLeft = d3.min([
      d3.max(labeledNodes.filter(d => d.role === "origin"), d => d.name.length),
      maxLenGlobal,
    ]);
    const maxLenRight = d3.min([
      d3.max(labeledNodes.filter(d => d.type === "ihr"), d => d.name.length),
      maxLenGlobal,
    ]);
    const left =
      getChartMargin(
        labeledNodes.filter(d => d.role === "origin").map(d => d.name),
        v => this.getName(v, maxLenLeft),
        params.labelShift
      ) + 45;
    const right = getChartMargin(
      labeledNodes.filter(d => d.type === "ihr").map(d => d.name),
      v => this.getName(v, maxLenRight),
      params.labelShift
    );

    // params.setMarginLeft(left);
    // params.setMarginRight(right);

    this.updateWidth({
      ...this.margin,
      left,
      right,
    });
    generator.size([this.width, this.height]);
    generator();

    // define constants used in highlight/unhighlight behavior
    const otherDir = dir === "target" ? "source" : "target";
    const linkKey = dir + "Links";
    const otherLinkKey = otherDir + "Links";

    const onlyPinnedLinks = d => !excludePinnedLinks(d);
    const unhighlight = () => {
      const clicked = chart.clicked !== null && chart.clicked !== undefined;
      chart
        .selectAll("rect, g.nodeLabel")
        .filter(d => {
          if (clicked) {
            const sameDirectionLinks =
              d.role === "origin" ? "sourceLinks" : "targetLinks";
            const otherRole = d.role === "origin" ? "target" : "source";
            return (
              d.index !== chart.clicked &&
              !d[sameDirectionLinks].some(
                dd => dd[otherRole].index === chart.clicked
              )
            );
          } else return true;
        })
        .classed(styles.highlighted, false);

      chart
        .selectAll("path")
        .filter(excludePinnedLinks)
        .classed(styles.highlighted, false);

      linkPaths.filter(excludePinnedLinks).sort(orderByValue);
    };
    this.unhighlight = unhighlight;

    // render nodes
    const nodeRects = chart
      .append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect");
    nodeRects
      .on("mouseover", d => updateTooltip(d, false))
      .attr("data-tip", true)
      .attr("data-for", "sankeyTooltip")
      .attr("data-index", d => d.index)
      .classed(styles.link, d => getIsLink(d))
      .on("mouseleave", unhighlight)
      .on("mouseenter", function highlightOnNodeEnter(d) {
        const isSortedSide =
          (d.role === "origin" && params.sortFunder === true) ||
          (d.role === "target" && params.sortFunder === false);

        const highlightIndicesNodes = [
          d.index, // TODO other nodes
        ];

        // add clicked node index
        if (chart.clicked !== undefined && chart.clicked !== null)
          highlightIndicesNodes.push(chart.clicked);

        const highlightIndicesLinks = [
          ...d.sourceLinks.map(dd => dd.index),
          ...d.targetLinks.map(dd => dd.index),
        ];

        // add nodes on other "side" connected to links
        d[isSortedSide ? linkKey : otherLinkKey]
          .map(d => d[isSortedSide ? otherDir : dir].index)
          .forEach(id => highlightIndicesNodes.push(id));
        chart
          .selectAll("rect, g.nodeLabel")
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
        // order by highlight on top
        linkPaths.sort(function(a, b) {
          return orderByHighlight(a, b, highlightIndicesLinks);
        });
      })
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("transform", function(d) {
        return "translate(" + d.x0 + "," + d.y0 + ")";
      })
      .on("click", function goToDetails(d) {
        nodeRects.classed(styles.pinned, false);
        d3.select(this).classed(styles.pinned, chart.clicked !== d.index);
        if (chart.clicked === d.index) return;
        else {
          params.setClicked(d.index);
          chart.clicked = d.index;
          unhighlight();
        }
      });

    // render links
    const linkPaths = chart
      .append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path");

    const orderByValue = (a, b) => {
      if (a.value > b.value) return 1;
      else if (b.value > a.value) return -1;
      else return 0;
    };

    const excludePinnedLinks = d => {
      const clicked = chart.clicked !== null && chart.clicked !== undefined;

      if (clicked) {
        return (
          d.source.index !== chart.clicked && d.target.index !== chart.clicked
        );
      } else return true;
    };

    const orderByHighlight = (a, b, highlightedIdx) => {
      if (highlightedIdx.includes(a.index)) return 1;
      else if (highlightedIdx.includes(b.index)) return -1;
      else return 0;
    };

    linkPaths
      .on("mouseover", d => updateTooltip(d, false))
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
          .selectAll("rect, g.nodeLabel")
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

        // order by highlight on top
        linkPaths.filter(excludePinnedLinks).sort(function(a, b) {
          return orderByHighlight(a, b, highlightIndicesLinks);
        });
        linkPaths.filter(onlyPinnedLinks).raise();
      })
      .attr("data-tip", true)
      .attr("data-for", "sankeyTooltip")
      .attr("d", this.sankeyLinkPath)
      .attr("data-index", d => d.index)
      .attr("stroke-width", function(d) {
        return d.width;
      });

    // render node labels
    chart
      .append("g")
      .selectAll("g.nodeLabel")
      .data(graph.nodes)
      .join("g")
      .attr("class", d => styles[d.role])
      .classed("nodeLabel", true)
      // .classed(styles.hidden, getBelowMinNodeHeight)
      .on("mouseover", d => {
        updateTooltip(d, true);
      })
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
      .attr("transform", function(d) {
        const xShift =
          params.labelShift * (d.role === "origin" ? -1 : 1) +
          (d.role === "origin" ? 0 : generator.nodeWidth() - 2);
        return (
          "translate(" + (d.x0 + xShift) + "," + (d.y1 + d.y0 + 5) / 2 + ")"
        );
      })
      .append("text")
      .classed(styles.link, d => getIsLink(d))
      .html(d => {
        const text = this.getName(
          d.name,
          d.role === "origin" ? maxLenLeft : maxLenRight
        );
        if (!getIsLink(d)) return text;
        else
          return `<a href="/details/${d.id}/${
            d.role === "origin" ? "funder" : "recipient"
          }">${text}</a>`;
      });

    // render chart title (centered over links)
    chart
      .append("text")
      .classed(styles.title, true)
      .style("text-anchor", "middle")
      .attr("transform", `translate(${this.width / 2}, -10)`)
      .text(params.xLabel);

    // flag icons
    const includeFlags = true;
    if (includeFlags) {
      chart.selectAll("g.nodeLabel:not(.iconned)").each(function addIcons(d) {
        const g = d3.select(this).classed("iconned", true);

        // left side: move left
        if (d.type !== "ihr") g.select("text").attr("x", -45);

        const axisGap = 3;
        // const axisGap = -7;
        const iconGroup = g
          .append("g")
          .attr("class", "icon")
          .attr("transform", `translate(${axisGap}, -5)`);

        const badgeHeight = 30;
        const badgeWidth = badgeHeight * 2;
        const badgeDim = {
          width: badgeWidth,
          height: badgeHeight,
          x: -badgeWidth + 12,
          y: -(badgeHeight / 2),
        };

        const flagUrl = d.flag_url;
        const showFlag = flagUrl !== null;
        if (showFlag) {
          iconGroup
            .append("image")
            .attr("href", d.flag_url)
            .attr("width", badgeDim.width)
            .attr("height", badgeDim.height)
            .attr("x", badgeDim.x)
            .attr("y", badgeDim.y)
            .on("load", function onError(d) {
              d3.select(this).style("display", "block");
            })
            .on("error", function onError(d) {
              d3.select(this).attr(
                "href",
                "https://flags.talusanalytics.com/64px/org.png"
              );
            });
        } else {
          // nudge y-axis tick label to right to occupy space where flag
          // would be
          g.select("text").attr("x", -10);
        }
      });
    }

    ReactTooltip.rebuild();

    this.removeClicked = () => {
      this.chart.clicked = null;
      this.unhighlight();
      nodeRects.classed(styles.pinned, false);
    };
  }
}
export default D3Sankey;
