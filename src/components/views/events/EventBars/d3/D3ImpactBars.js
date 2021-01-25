import React from "react";
import * as d3 from "d3/dist/d3.min";
import Chart from "../../../../chart/Chart.js";
import Util, { getInitCap, formatRegion } from "../../../../misc/Util.js";
import styles from "./d3impactbars.module.scss";
import ReactTooltip from "react-tooltip";

class D3ImpactBars extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Define data
    this.params = params;

    // Define margins
    this.margin = {};

    // Set dimensions
    this.width = this.containerwidth;
    this.height = this.containerheight;
    this.margin = { top: 50, right: 20, bottom: 35, left: 50 };

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
      .tickSizeInner(0)
      .tickSizeOuter(5)
      .tickPadding(8)
      .tickFormat(Util.formatSIInteger)
      .ticks(2)
      .scale(x);

    // y-axis
    const yAxis = d3
      .axisLeft()
      .scale(y)
      .tickSize(0)
      .tickSizeOuter(5)
      .tickPadding(50);

    const allBars = chart.append("g").classed(styles.barGroup, true);

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

    // add y-axis label
    // const yLabel = chart
    //   .append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0)
    //   .attr("x", -height / 2)
    //   .style("font-weight", 600)
    //   .style("text-anchor", "middle")
    //   .attr("class", [styles["axis-label"], "y-label-text"].join(" "))
    //   .text("y-axis label");

    this.update = (data, newFlowType = params.curFlowType, params) => {
      const sort = params.sort;

      // format stack bar data
      let stackXMax, stackData;
      // const noRegion = [];
      if (params.stack) {
        stackData = [];
        const dataByRegion = {};
        data.forEach(d => {
          const region = d.region_who || "None";
          // if (region === "None") {
          //   noRegion.push(d);
          // }
          if (dataByRegion[region] === undefined) {
            dataByRegion[region] = [d];
          } else if (
            d.value !== 0 &&
            d.value !== undefined &&
            d.value !== null
          ) {
            dataByRegion[region].push(d);
          }
        });
        for (const [region, children] of Object.entries(dataByRegion)) {
          stackData.push({
            name: region,
            children: children.sort((a, b) => {
              return d3.descending(a.sort, b.sort);
            }),
            value: d3.sum(children, d => d.value),
            sort: d3.sum(children, d => d.sort),
            bar_id: `${region}-${newFlowType}`,
          });
        }
        stackXMax = d3.max(stackData, d => d.value);
        data = stackData;
      }

      // Sort
      data.sort((a, b) => {
        return d3.descending(a.sort, b.sort);
      });

      // keep only `max` number of data
      data = data.slice(0, params.max || 1e6);

      function updateTooltip(dTmp) {
        const d = typeof dTmp === "object" ? dTmp.name : dTmp;
        const tooltipData = [
          {
            field: "Name",
            value: params.stack
              ? formatRegion(dataByName[d].name)
              : dataByName[d].name,
          },
          {
            field: xLabel.text(),
            value: Util.formatSIInteger(dataByName[d].value),
          },
        ];
        params.setTooltipData(tooltipData);
      }

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
      let bars = allBars.selectAll("." + styles.bar).data(data, d => d.bar_id); // TODO check
      bars.exit().remove();

      const newGroups = bars
        .enter()
        .append("g")
        .attr("class", styles.bar)
        .attr("id", d => {
          return d.bar_id;
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

      // set axes labels
      xLabel.text(
        getInitCap(params.impact) +
          " by " +
          (params.stack ? "region" : "country")
      );

      chart.select(".y-label-text").attr("x", -newHeight / 2);

      xAxis.scale(x);
      const durationHorizontal = params.sortOnly ? 0 : 1000;
      xAxisG.transition().duration(durationHorizontal);
      if (!isNaN(xMax))
        xAxisG.call(xAxis.tickValues(this.getTickValues(xMax, 3)));

      yAxis.scale(y);

      // get flag URLs by name
      const dataByName = {};
      data.forEach(d => {
        dataByName[d.name] = d;
      });

      const getShortName = this.getShortName;
      yAxisG
        .call(yAxis)
        .selectAll("text")
        .each(function(d) {
          d3.select(this).html(
            `<a href="/details/${dataByName[d].id}/recipient">${getShortName(
              d
            )}</a>`
          );
        });

      chart.selectAll(".tick").classed(styles.tick, true);

      // add dots
      const r = 5;
      const cy = r / 2 + bandwidth / 2;
      bars
        .selectAll("circle")
        .data(d => [d])
        .enter()
        .append("circle")
        .style("display", d => (d.value !== null ? "block" : "none"))
        .attr("data-tip", true)
        .attr("data-for", "chartTooltip")
        .on("mouseover", updateTooltip)
        .attr("r", 5)
        .attr("cy", cy)
        .transition()
        .duration(durationHorizontal)
        .attr("cx", d => x(d.value));

      // y-axis tick tooltips
      chart
        .selectAll(".y.axis .tick")
        .attr("data-tip", true)
        .attr("data-for", "chartTooltip")
        .on("mouseover", updateTooltip);

      // flag icons
      chart.selectAll(".y.axis .tick:not(.iconned)").each(function addIcons(d) {
        const g = d3.select(this).classed("iconned", true);
        const xOffset = -1 * (d.tickTextWidth + 7) - 5 - 5;
        const axisGap = -7;
        const iconGroup = g
          .append("g")
          .attr("class", "icon")
          .attr("transform", `translate(${axisGap}, 0)`);

        const badgeHeight = 30;
        const badgeWidth = badgeHeight * 2;
        const badgeDim = {
          width: badgeWidth,
          height: badgeHeight,
          x: -badgeWidth + 12,
          y: -(badgeHeight / 2),
        };
        iconGroup
          // .classed(styles.showNoScore, jeesWhite)
          .append("image")
          .attr("href", dataByName[d].flag_url)
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

        // const badgeLabelText =
        //   scoreData.name === "General IHR" ? "GEN" : scoreData.name;
        // badgeGroup
        //   .append("text")
        //   .attr("text-anchor", "middle")
        //   .attr("x", -(badgeDim.width / 2))
        //   .attr("dy", ".35em")
        //   .style("fill", "white")
        //   .text(badgeLabelText);
      });
      allBars.raise();

      ReactTooltip.rebuild();
    };
    this.update(params.data, params.curFlowType, params);
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
  getShortName(s) {
    if (s === "General IHR") return s;
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
}
export default D3ImpactBars;
