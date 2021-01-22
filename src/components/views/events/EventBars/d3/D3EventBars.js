import React from "react";
import * as d3 from "d3/dist/d3.min";
import Chart from "../../../../chart/Chart.js";
import Util from "../../../../misc/Util.js";
import styles from "./d3eventbars.module.scss";
import ReactTooltip from "react-tooltip";

class D3EventBars extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Define data
    this.params = params;

    // Define margins
    this.margin = {};

    // Set dimensions
    this.width = this.containerwidth;
    this.height = this.containerheight;
    this.margin = { top: 50, right: 70, bottom: 35, left: 350 };

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
    const chart = this.chart.classed("event-impacts-chart", true);

    // define dimension accessors
    const margin = this.margin;
    const width = this.width;
    const height = this.height;

    // Define scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().padding(0.25);

    // // Define color scale
    // const colorScale = d3.scaleLinear().range(["blue", "blue"]);

    // x-axis
    const xAxis = d3
      .axisTop()
      .ticks(5)
      .tickSizeInner(0)
      .tickSizeOuter(5)
      .tickPadding(8)
      .tickFormat(Util.formatSIInteger)
      .scale(x);

    // y-axis
    const yAxis = d3
      .axisLeft()
      .scale(y)
      .tickSize(0)
      .tickSizeOuter(5)
      // TODO format country name / flag
      // .tickFormat(v => {
      //   if (v === undefined) return "";
      //   return this.getShortName(
      //     core_capacities.find(cc => cc.value === v || cc.label === v).label
      //   );
      // })
      .tickPadding(50);

    const allBars = chart.append("g");

    const xAxisG = chart
      .append("g")
      .attr("class", "x axis")
      .style("stroke-width", 1);

    const yAxisG = chart
      .append("g")
      .attr("class", "y axis")
      .call(yAxis);

    // add axes labels
    let xAxisLabel = "";
    chart
      .append("text")
      .attr("class", styles["axis-label"])
      .attr("x", width / 2)
      .attr("y", -70)
      .text(xAxisLabel);

    const xLabel = chart
      .append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .style("font-weight", 600)
      .style("text-anchor", "middle")
      .attr("class", styles["axis-label"])
      .text("Funds");

    const getYLabelPos = data => {
      const fakeText = chart
        .selectAll(".fake-text")
        .data(data)
        .enter()
        .append("text")
        .text(d => d.tickText)
        .attr("class", [styles.tick, styles.fakeText].join(" "));
      const maxLabelWidth = d3.max(fakeText.nodes(), d => d.getBBox().width);
      fakeText.remove();
      const margin = 65;
      return -(maxLabelWidth + margin) || -this.margin.left + 10;
    };

    const yLabel = chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -height / 2)
      .style("font-weight", 600)
      .style("text-anchor", "middle")
      .attr("class", [styles["axis-label"], "y-label-text"].join(" "))
      .text("y-axis label");
    this.update = (data, newFlowType = params.curFlowType) => {
      const sort = params.sort;

      const fakeText = chart
        .selectAll(".fake-text")
        .data(data) // TODO structure data
        .enter()
        .append("text")
        .text(d => {
          return "Label"; // TODO
        })
        .attr("class", styles.tick)
        .each(function(d) {
          d.tickTextWidth = this.getBBox().width;
        });
      fakeText.remove();

      const newHeight = 30 * data.length; // TODO confirm
      this.svg.attr("height", newHeight + margin.top + margin.bottom);

      // set new axes and transition
      const maxVal = d3.max(data, d => d.value);
      const xMax = 1.1 * maxVal;
      x.domain([0, xMax]);
      y.domain(data.map(d => d.name)).range([0, newHeight]);
      const bandwidth = y.bandwidth();

      // // Sort
      // if (sort === "amount") {
      //   barGroupData.sort((a, b) => {
      //     return d3.descending(a.value, b.value);
      //   });
      // } else {
      //   barGroupData.sort((a, b) => {
      //     return d3.descending(a.data.avgScore, b.data.avgScore);
      //   });
      // }

      // // Update y scale to match sorting order.
      // y.domain(barGroupData.map(d => d.name));

      // remove first
      let bars = allBars.selectAll("." + styles.bar).data(data, d => [d]); // TODO check
      bars.exit().remove();

      const newGroups = bars
        .enter()
        .append("g")
        .attr("class", styles.bar)
        .attr("id", d => {
          return d.name + " - " + newFlowType;
        });

      bars = newGroups.merge(bars);
      if (params.sortOnly) {
        bars
          .transition()
          .duration(1000)
          .attr("transform", d => `translate(0, ${y(d.name)})`);
      } else {
        bars.attr("transform", d => `translate(0, ${y(d.name)})`);
      }

      const durationHorizontal = params.sortOnly ? 0 : 1000;
      bars
        .selectAll("rect")
        .data(d => [d])
        .enter()
        .append("rect")
        .attr("data-tip", true)
        .attr("data-for", "chartTooltip")
        .on("mouseover", function updateTooltip(d) {
          const tooltipData = [
            {
              field: "Name",
              value: "Value",
            },
          ];
          params.setTooltipData(tooltipData);
        })
        .attr("height", bandwidth)
        // .style("fill", d => colorScale(d.value))
        .transition()
        .duration(durationHorizontal)
        .attr("x", d => x(0))
        // .attr("y", d => y(d.name))
        .attr("width", d => x(d.value)); // TODO check
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
      xAxisG.transition().duration(durationHorizontal);
      if (!isNaN(xMax))
        xAxisG.call(xAxis.tickValues(this.getTickValues(xMax, 7)));

      yAxis.scale(y);
      yAxisG
        .transition()
        .duration(1000)
        .call(yAxis);

      newGroups
        .append("text")
        .attr("class", "bar-label")
        // .attr("y", d => y(d.name))
        .attr("dy", "1em")
        .text(d => {
          if (d.value !== 0) {
            return Util.money(d.value);
          }
        })
        .transition()
        .duration(durationHorizontal)
        .attr("x", d => x(d.value) + 5);

      chart.selectAll(".tick").classed(styles.tick, true);

      // // add badges
      // chart
      //   .selectAll(".y.axis .tick:not(.badged)")
      //   .each(function addJeeIcons(d) {
      //     const scoreData = barGroupData.find(dd => dd.name === d);
      //     const score = scoreData.data.avgScore;
      //     const g = d3.select(this).classed("badged", true);
      //     const xOffset = -1 * (scoreData.data.tickTextWidth + 7) - 5 - 5;
      //     const axisGap = -7;
      //     const badgeGroup = g
      //       .append("g")
      //       .attr("class", "score-badge")
      //       .attr("transform", `translate(${axisGap}, 0)`);
      //     // .classed(styles.unscored, !showJee);
      //
      //     const badgeHeight = 16 * 1.25;
      //     const badgeWidth = 30 * 1.25;
      //     const badgeDim = {
      //       width: badgeWidth,
      //       height: badgeHeight,
      //       x: -badgeWidth,
      //       y: -(badgeHeight / 2),
      //       rx: 2.5,
      //     };
      //     badgeGroup
      //       .classed(styles.showNoScore, jeesWhite)
      //       .append("rect")
      //       .style("fill", score ? jeeColorScale(score) : "#ccc")
      //       .attr("width", badgeDim.width)
      //       .attr("height", badgeDim.height)
      //       .attr("rx", badgeDim.rx)
      //       .attr("x", badgeDim.x)
      //       .attr("y", badgeDim.y);
      //
      //     const badgeLabelText =
      //       scoreData.name === "General IHR" ? "GEN" : scoreData.name;
      //     badgeGroup
      //       .append("text")
      //       .attr("text-anchor", "middle")
      //       .attr("x", -(badgeDim.width / 2))
      //       .attr("dy", ".35em")
      //       .style("fill", "white")
      //       .text(badgeLabelText);
      //   });

      // attach tooltips to y-axis labels
      // TODO

      // if no data, hide chart and show message
      // TODO

      yLabel
        .transition()
        .duration(1000)
        .attr("y", getYLabelPos(data)); // TODO check

      // // Update y-axis label tooltips
      // chart
      //   .selectAll(".y.axis .tick")
      //   .attr("data-tip", true)
      //   .attr("data-for", "chartTooltip")
      //   .on("mouseover", function updateTooltip(d) {
      //     const match = barGroupData.find(dd => dd.name === d);
      //     if (match === undefined) return;
      //     params.setTooltipData([
      //       {
      //         field: "Core capacity",
      //         value: match.data.info.label,
      //       },
      //       {
      //         field: `Total ${params.flowTypeName.toLowerCase()}`,
      //         value: Util.money(match.value),
      //       },
      //     ]);
      //   });

      ReactTooltip.rebuild();
    };
    this.update(params.data, params.curFlowType, {
      ...params,
    });
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
export default D3EventBars;
