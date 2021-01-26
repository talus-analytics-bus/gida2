import React from "react";
import * as d3 from "d3/dist/d3.min";
import Chart from "../../../../chart/Chart.js";
import Util, { formatRegion } from "../../../../misc/Util.js";
import styles from "./d3eventbars.module.scss";
import ReactTooltip from "react-tooltip";

// colors
import {
  outbreakBlue2,
  outbreakBlue3,
  outbreakBlue4,
  outbreakBlue5,
} from "../../../../../assets/styles/colors.scss";

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
      //   return this.getShortName(v);
      // })
      .tickPadding(params.stack ? 10 : 50);

    if (params.stack) yAxis.tickFormat(formatRegion);

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
      .classed("axis-title", true)
      .text("Funds");

    const getYLabelPos = data => {
      const fakeText = chart
        .selectAll(".fake-text")
        .data(data)
        .enter()
        .append("text")
        .text(d => d.name)
        .attr("class", [styles.tick, styles.fakeText].join(" "));
      const maxLabelWidth = d3.max(fakeText.nodes(), d => d.getBBox().width);
      fakeText.remove();
      const margin = 65;
      return -(maxLabelWidth + margin) || -this.margin.left + 10;
    };

    const getLeftMargin = (data, fmt, padding = 0) => {
      const fakeText = chart
        .selectAll(".fake-text")
        .data(data)
        .enter()
        .append("text")
        .text(d => fmt(d.name))
        .attr("class", [styles.tick, styles.fakeText].join(" "));
      const maxLabelWidth = d3.max(fakeText.nodes(), d => d.getBBox().width);
      fakeText.remove();
      return maxLabelWidth + padding;
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

    function getRunningValues(data, sortKey) {
      data
        .map(d => {
          let runningValue = 0;
          d.children = d3.shuffle(
            d.children.map(c => {
              c.value0 = runningValue;
              runningValue += c.value;
              c.value1 = runningValue;
              return c;
            })
          );
          return d;
        })
        .sort((a, b) => a[sortKey] > b[sortKey]);
      return data;
    }
    this.update = function(newData, newFlowType = params.curFlowType, params) {
      const allFundsZero = !newData.some(d => d.value !== 0);
      const sortKey = allFundsZero ? "impact" : "value";
      // format stack bar data
      let stackXMax, stackData;
      if (params.stack) {
        stackData = [];
        const newDataByRegion = {};
        newData.forEach(d => {
          const region = d.region_who || "None";
          if (newDataByRegion[region] === undefined) {
            newDataByRegion[region] = [d];
          } else if (
            d[sortKey] !== 0 &&
            d[sortKey] !== undefined &&
            d[sortKey] !== null
          ) {
            newDataByRegion[region].push(d);
          }
        });
        for (const [region, children] of Object.entries(newDataByRegion)) {
          children.forEach(d => {
            d.region = region;
          });
          stackData.push({
            name: region,
            children: children.sort((a, b) => {
              return d3.descending(a[sortKey], b[sortKey]);
            }),
            value: d3.sum(children, d => d.value),
            impact: d3.sum(children, d => d.impact),
            bar_id: `${region}-${newFlowType}`,
          });
        }
        getRunningValues(stackData, sortKey);
        stackXMax = d3.max(stackData, d => d.value);
        newData = stackData;
      }

      // Sort
      newData.sort((a, b) => {
        return d3.descending(a[sortKey], b[sortKey]);
      });

      // keep only `max` number of data
      newData = newData.slice(0, params.max || 1e6);
      const getShortName = this.getShortName;

      const tickFormat = params.stack ? formatRegion : getShortName;
      const padding = params.stack ? 20 : 60;
      this.updateWidth({
        ...this.margin,
        left: getLeftMargin(newData, tickFormat, padding),
      });

      xLabel.attr("x", this.width / 2);

      // update xscale
      x.range([0, this.width]);

      // get flag URLs and other data by name of stakeholder
      const dataByName = {};
      newData.forEach(d => {
        if (params.stack) {
          if (dataByName[d.name] === undefined) {
            dataByName[d.name] = {};
            d.children.forEach(dd => {
              dataByName[d.name][dd.name] = dd;
            });
          }
        } else {
          dataByName[d.name] = d;
        }
      });

      function updateTooltip(dTmp, region) {
        const d = typeof dTmp === "object" ? dTmp.name : dTmp;
        if (params.stack) {
          const isBarSegment = dataByName[region] !== undefined;
          const isBarLabel = !isBarSegment;
          if (isBarSegment) {
            const tooltipData = [
              {
                field: "Name",
                value: dataByName[region][d].name,
              },
              {
                field: xLabel.text().replace(" (USD)", ""),
                value: Util.money(dataByName[region][d].value),
              },
            ];
            params.setTooltipData(tooltipData);
          } else if (isBarLabel) {
            const tooltipData = [
              {
                field: "Name",
                value: formatRegion(d),
              },
              {
                field: xLabel.text().replace(" (USD)", ""),
                value: Util.money(
                  d3.sum(Object.values(dataByName[d]), dd => dd.value)
                ),
              },
            ];
            params.setTooltipData(tooltipData);
          }
        } else {
          const tooltipData = [
            {
              field: "Name",
              value: dataByName[d].name,
            },
            {
              field: xLabel.text().replace(" (USD)", ""),
              value: Util.money(dataByName[d].value),
            },
          ];
          params.setTooltipData(tooltipData);
        }
      }

      const fakeText = chart
        .selectAll(".fake-text")
        .data(newData) // TODO structure data
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

      const newHeight = 40 * newData.length; // TODO confirm
      this.svg.attr("height", newHeight + margin.top + margin.bottom);

      // set new axes and transition
      // if stack: set xMax based on sum of bar segments
      const defaultXMax = 1000;
      let xMax;
      if (params.stack) xMax = 1.1 * stackXMax || defaultXMax;
      else {
        const maxVal = d3.max(newData, d => d.value);
        xMax = 1.1 * maxVal || defaultXMax;
      }
      x.domain([0, xMax]);
      y.domain(newData.map(d => d.name)).range([0, newHeight]);
      const bandwidth = y.bandwidth();

      // remove first
      let bars = allBars
        .selectAll("." + styles.bar)
        .data(newData, d => d.bar_id); // TODO check
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

      const durationHorizontal = params.sortOnly ? 0 : 1000;
      if (params.stack) {
        const colors = [
          outbreakBlue2,
          outbreakBlue3,
          outbreakBlue4,
          outbreakBlue5,
        ];
        newData.forEach(stackBar => {
          const seed = parseInt(Math.random() * colors.length);
          bars
            .selectAll("rect")
            .data(d => d.children)
            .enter()
            .append("rect")
            .style("fill", (d, i) => {
              const idx = (i + seed) % colors.length;
              return colors[idx];
            })
            .attr("data-tip", true)
            .attr("data-for", "chartTooltip")
            .on("mouseover", d => {
              updateTooltip(d, d.region);
            })
            .attr("height", bandwidth)
            .transition()
            .duration(durationHorizontal)
            .attr("x", d => x(d.value0))
            .attr("width", d => x(d.value1) - x(d.value0));
        });
      } else {
        bars
          .selectAll("rect")
          .data(d => [d])
          .enter()
          .append("rect")
          .attr("data-tip", true)
          .attr("data-for", "chartTooltip")
          .on("mouseover", updateTooltip)
          .attr("height", bandwidth)
          .transition()
          .duration(durationHorizontal)
          .attr("x", d => x(0))
          .attr("width", d => x(d.value));
      }

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

      const urlFormat = params.stack
        ? d => `<tspan>${tickFormat(d)}</tspan>`
        : d =>
            `<a href="/details/${dataByName[d].id}/${params.role}">${tickFormat(
              d
            )}</a>`;
      yAxisG
        .call(yAxis)
        .selectAll("text")
        .each(function(d) {
          d3.select(this).html(urlFormat(d));
        });

      newGroups
        .append("text")
        .attr("class", "bar-label")
        .attr("dy", "1.2em")
        .text(d => {
          if (d.value !== 0) {
            return Util.money(d.value);
          }
        })
        .transition()
        .duration(durationHorizontal)
        .attr("x", d => x(d.value) + 5);

      chart.selectAll(".tick").classed(styles.tick, true);

      // y-axis tick tooltips
      chart
        .selectAll(".y.axis .tick")
        .attr("data-tip", true)
        .attr("data-for", "chartTooltip")
        .on("mouseover", updateTooltip);

      // flag icons
      if (!params.stack) {
        chart
          .selectAll(".y.axis .tick:not(.iconned)")
          .each(function addIcons(d) {
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
          });
      }

      ReactTooltip.rebuild();
    };
    if (this.initialized !== true) {
      this.update(params.data, params.curFlowType, {
        ...params,
      });
      this.initialized = true;
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
      return shortened === s ? s : `${shortened}...`;
    } else {
      return s;
    }
  }
}
export default D3EventBars;
