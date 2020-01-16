import React from "react";
import * as d3 from "d3/dist/d3.min";
import Chart from "../../chart/Chart.js";
import Util from "../../misc/Util.js";
import styles from "./d3stackbar.module.scss";
import { core_capacities } from "../../misc/Data.js";
import {
  getMapColorScale,
  jeeColors,
  purples,
  greens
} from "../../map/MapUtil.js";
import ReactTooltip from "react-tooltip";

/**
 * Creates a D3.js world map in the container provided
 * @param {String} selector A selector of the container element the map will be placed in
 * @return {Object} An object containing the map and the layer containing drawn items
 */
class D3StackBar extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Define data
    this.params = params;

    // Define margins
    this.margin = {};

    // Set dimensions
    this.width = this.containerwidth;
    this.height = this.containerheight;
    this.margin = { top: 50, right: 20, bottom: 35, left: 350 };

    // Initialize chart
    this.init();

    // Draw chart
    this.draw();
  }

  draw() {
    // Initialize some constants
    // Params object
    const params = this.params;

    // List of core capacities with display names, etc.
    const capacities = core_capacities;

    let colors = params.nodeType === "target" ? purples : greens;
    colors = colors.slice(0, 5);

    // define chart accessor
    const chart = this.chart.classed("category-chart", true);

    // define dimension accessors
    const margin = this.margin;
    const width = this.width;
    const height = this.height;

    // whether chart has CC badges on it
    chart.badged = false;

    // Define scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().padding(0.25);

    // Define color scale
    const colorScale = d3.scaleOrdinal().range(colors);

    // x-axis
    const xAxis = d3
      .axisTop()
      .ticks(5)
      .tickSizeInner(0)
      .tickSizeOuter(5)
      .tickPadding(8)
      .tickFormat(Util.formatSI)
      .scale(x);

    // y-axis
    const yAxis = d3
      .axisLeft()
      .scale(y)
      .tickSize(0)
      .tickSizeOuter(5)
      .tickFormat(v => {
        if (v === undefined) return "";
        return this.getShortName(
          core_capacities.find(cc => cc.value === v).label
        );
      })
      .tickPadding(45);

    const allBars = chart.append("g");

    const xAxisG = chart
      .append("g")
      .attr("class", "x axis")
      .style("stroke-width", 1)
      .call(xAxis);

    const yAxisG = chart
      .append("g")
      .attr("class", "y axis")
      .call(yAxis);
    // .style("font-size", "0.4em");

    // add axes labels
    let xAxisLabel = "";
    chart
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", -70)
      // .style("font-size", "1.25em")
      .text(xAxisLabel);

    const xLabel = chart
      .append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .style("font-weight", 600)
      .style("text-anchor", "middle")
      // .style("font-size", "14px")
      .text("Funds");

    const getYLabelPos = data => {
      const fakeText = chart
        .selectAll(".fake-text")
        .data(data)
        .enter()
        .append("text")
        .text(d => d.tickText)
        // .text(d => d.info.label)
        .attr("class", [styles.tick, styles.fakeText].join(" "));
      const maxLabelWidth = d3.max(fakeText.nodes(), d => d.getBBox().width);
      fakeText.remove();
      const margin = 60;
      return -(maxLabelWidth + margin);
    };

    const yLabel = chart
      .append("text")
      .attr("class", "y-label-text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -height / 2)
      .style("font-weight", 600)
      .style("text-anchor", "middle")
      // .style("font-size", "14px")
      .text("Core capacity");

    this.updateStackBar = (
      rawData,
      newFlowType = params.flowType,
      params = {}
    ) => {
      // Get JEE scolor scale.
      const jeeColorScale = getMapColorScale({
        supportType: "jee"
      });

      // determine whether this is a country with jee scores available
      const showJee = params.jeeScores !== undefined;
      const scores = params.jeeScores; // undefined if not available
      let data = rawData; // TODO check

      const sort = this.params.sort;
      // const sort = $('input[name="jee-sort"]:checked').attr("ind");
      if (sort === "score") {
        // TODO sorting algorithm
        // data = _.sortBy(_.sortBy(data, "jeeIdx"), d => -1 * d.avgScore);
      }
      const coreCapacitiesInData = [...new Set(data.map(d => d.attribute))];
      const coreCapacitiesInData2 = [];
      coreCapacitiesInData.forEach(cc => {
        coreCapacitiesInData2.push({
          info: core_capacities.find(dd => dd.value === cc),
          avgScore: params.jeeScores ? params.jeeScores[cc] : 0,
          avgScoreRounded: params.jeeScores
            ? Math.round(params.jeeScores[cc])
            : 0,
          tickTextWidth: undefined,
          value: cc
        });
      });

      coreCapacitiesInData2.forEach(datum => {
        datum.tickText = yAxis.tickFormat()(datum.value);
      });
      const fakeText = chart
        .selectAll(".fake-text")
        .data(coreCapacitiesInData2)
        .enter()
        .append("text")
        .text(d => d.info.label) // TODO ellipsis
        .attr("class", styles.tick)
        // .style("font-size", "12px")
        .each(function(d) {
          d.tickTextWidth = this.getBBox().width;
        });
      fakeText.remove();

      const newHeight = 30 * coreCapacitiesInData2.length;
      d3.select(".category-chart").attr(
        "height",
        newHeight + margin.top + margin.bottom
      );

      // set new axes and transition
      const maxVal = d3.max(data, d => d[newFlowType]);
      // const maxChild = d3.max(data, d =>
      //   d3.max(d.children, c => c[newFlowType])
      // );
      const xMax = 1.1 * maxVal;
      x.domain([0, xMax]);

      // TODO check this
      y.domain(coreCapacitiesInData2.map(d => d.value)).range([0, newHeight]);

      colorScale.domain([0, maxVal]);
      const bandwidth = y.bandwidth();

      // Get bar group data
      const barGroupData = [];
      coreCapacitiesInData2.forEach(attribute => {
        const barGroupDatum = {
          name: attribute.value,
          data: attribute,
          children: data.filter(d => d.attribute === attribute.value)
        };
        barGroupDatum.value = d3.sum(
          barGroupDatum.children,
          d => d[newFlowType]
        );
        barGroupData.push(barGroupDatum);
      });
      this.getRunningValues(barGroupData, newFlowType);

      // remove first
      let barGroups = allBars
        .selectAll(".bar-group")
        .remove()
        .exit()
        .data(barGroupData);

      const newGroups = barGroups
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(0, ${y(d.name)})`);

      barGroups = newGroups.merge(barGroups);
      barGroups
        .selectAll("rect")
        .data(d =>
          d.children.map(c => ({
            cc: d.name,
            ccFull: d.data.info.label,
            country: c
          }))
        )
        .enter()
        .append("rect")
        .attr("data-tip", true)
        .attr("data-for", "chartTooltip")
        .on("mouseover", function updateTooltip(d) {
          params.setTooltipData([
            {
              field: "Core capacity",
              value: d.ccFull
            },
            {
              field: params.nodeType === "target" ? "Funder" : "Recipient",
              value:
                d.country[params.nodeType === "target" ? "source" : "target"]
            },
            {
              field: `Total ${params.flowTypeName.toLowerCase()}`,
              value: Util.money(d.country[params.flowType])
            }
          ]);
        })
        .attr("height", bandwidth)
        .style("fill", d => colorScale(d.country[newFlowType]))
        .transition()
        .duration(1000)
        .attr("x", d => x(d.country.value0))
        .attr("width", d => x(d.country.value1) - x(d.country.value0));

      // set axes labels
      let xLabelPreText = "Disbursed";
      if (params.nodeType === "recipient") {
        if (newFlowType === "disbursed_funds") {
          xLabelPreText = "Disbursed";
        } else {
          xLabelPreText = "Committed";
        }
      } else {
        if (newFlowType === "disbursed_funds") {
          xLabelPreText = "Disbursed";
        } else {
          xLabelPreText = "Committed";
        }
      }
      xLabel.text(`${xLabelPreText} funds (${Util.money(0).split(" ")[1]})`);

      chart.select(".y-label-text").attr("x", -newHeight / 2);

      xAxis.scale(x);
      xAxisG
        .transition()
        .duration(1000)
        .call(xAxis.tickValues(this.getTickValues(xMax, 7)));

      yAxis.scale(y);
      yAxisG
        .transition()
        .duration(1000)
        .call(yAxis);

      barGroups
        .append("text")
        .attr("class", "bar-label")
        .attr("y", y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => {
          if (showJee || d.value !== 0) {
            return Util.money(d.value);
          }
        })
        .transition()
        .duration(1000)
        .attr("x", d => x(d.value) + 5);

      chart.selectAll(".tick").classed(styles.tick, true);
      chart
        .selectAll(".y.axis .tick:not(.badged)")
        .each(function addJeeIcons(d) {
          const scoreData = barGroupData.find(dd => dd.name === d);
          const score = scoreData.data.avgScoreRounded;
          const g = d3.select(this).classed("badged", true);
          const xOffset = -1 * (scoreData.data.tickTextWidth + 7) - 5 - 5;
          const axisGap = -7;
          const badgeGroup = g
            .append("g")
            .attr("class", "score-badge")
            .attr("transform", `translate(${axisGap}, 0)`)
            .classed(styles.unscored, !showJee);

          const badgeHeight = 16;
          const badgeWidth = 30;
          const badgeDim = {
            width: badgeWidth,
            height: badgeHeight,
            x: -badgeWidth,
            y: -(badgeHeight / 2),
            rx: 2.5
          };
          badgeGroup
            .append("rect")
            .style("fill", score ? jeeColorScale(score) : "gray")
            .attr("width", badgeDim.width)
            .attr("height", badgeDim.height)
            .attr("rx", badgeDim.rx)
            .attr("x", badgeDim.x)
            .attr("y", badgeDim.y);

          const badgeLabelText =
            scoreData.name === "General IHR" ? "GEN" : scoreData.name;
          badgeGroup
            .append("text")
            .attr("text-anchor", "middle")
            .attr("x", -(badgeDim.width / 2))
            .attr("dy", ".35em")
            .style("fill", "white")
            .text(badgeLabelText);
        });

      // attach tooltips to y-axis labels
      // TODO

      // if no data, hide chart and show message
      // TODO

      yLabel
        .transition()
        .duration(1000)
        .attr("y", getYLabelPos(coreCapacitiesInData2));

      // Update y-axis label tooltips
      chart
        .selectAll(".y.axis .tick")
        .attr("data-tip", true)
        .attr("data-for", "chartTooltip")
        .on("mouseover", function updateTooltip(d) {
          const match = barGroupData.find(dd => dd.name === d);
          if (match === undefined) return;
          params.setTooltipData([
            {
              field: "Core capacity",
              value: match.data.info.label
            },
            {
              field: `Total ${params.flowTypeName.toLowerCase()}`,
              value: Util.money(match.value)
            }
          ]);
        });

      ReactTooltip.rebuild();
    };
    this.updateStackBar(params.data, params.flowType, {
      ...params
    });
  }

  getRunningValues(data, flowType) {
    data
      .map(d => {
        let runningValue = 0;
        d.children = d3.shuffle(
          d.children.map(c => {
            c.value0 = runningValue;
            runningValue += c[flowType];
            c.value1 = runningValue;
            return c;
          })
        );
        return d;
      })
      .sort((a, b) => a[flowType] > b[flowType]);
    return data;
  }

  getShortName(s) {
    if (s === "General IHR Implementation") return s;
    const maxLen = 20;
    if (s.length > maxLen) {
      const shortened = s
        .split(" ")
        .slice(0, 4)
        .join(" ");
      if (/[^a-z]$/.test(shortened.toLowerCase())) {
        return `${shortened.slice(0, shortened.length - 1)}...`;
      }
      return `${shortened}...`;
    } else {
      return s;
    }
  }

  getTickValues(maxVal, numTicks) {
    const magnitude = Math.floor(Math.log10(maxVal)) - 1;
    var vals = [0];
    for (var i = 1; i <= numTicks; i++) {
      if (i === numTicks) {
        vals.push(maxVal);
      } else {
        vals.push(this.precisionRound((i / numTicks) * maxVal, -magnitude));
      }
    }
    return vals;
  }

  precisionRound(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
}
export default D3StackBar;
