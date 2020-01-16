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
        return core_capacities.find(cc => cc.value === v).label;
      })
      // .tickFormat(Util.getScoreShortName)
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
      .call(yAxis)
      .style("font-size", "0.4em");

    // add axes labels
    let xAxisLabel = "";
    chart
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", -70)
      .style("font-size", "1.25em")
      .text(xAxisLabel);

    const xLabel = chart
      .append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .style("font-weight", 600)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Funds");

    const getYLabelPos = data => {
      const fakeText = chart
        .selectAll(".fake-text")
        .data(data)
        .enter()
        .append("text")
        .text(d => d.tickText)
        .attr("class", "tick fake-text")
        .style("font-size", "12px");
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
      .style("font-size", "14px")
      .text("Core capacity");

    this.updateStackBar = (
      rawData,
      newFlowType = params.flowType,
      params = {}
    ) => {
      console.log("Running update function!");
      // Get JEE scolor scale.
      const jeeColorScale = getMapColorScale({
        supportType: "jee"
      });
      // determine whether this is a country with jee scores available
      const showJee = params.showJee;
      const scores = params.jeeScores; // undefined if not available

      let data = rawData; // TODO check
      console.log("scores");
      console.log(scores);
      console.log("data");
      console.log(data);
      // let data = this.getRunningValues(rawData, newFlowType)
      //   .sort((a, b) => {
      //     if (a[newFlowType] < b[newFlowType]) {
      //       return 1;
      //     } else {
      //       return -1;
      //     }
      //   })
      //   .filter(d => showJee || d[newFlowType] !== 0);
      //
      // data = data.map(d => {
      //   return { ...d, displayName: d.name.split(" - ").reverse()[0] };
      // });
      //
      // if (scores !== undefined) {
      //   data.forEach(datum => {
      //     datum.jeeIdx = capacities.find(
      //       capacity => capacity.id === datum.id
      //     ).idx;
      //
      //     // get average score for this CC
      //     const avgScore = d3.mean(
      //       _.pluck(scores.indScores[datum.id], "score")
      //     );
      //     datum.avgScore = avgScore;
      //     datum.avgScoreRounded = Math.round(avgScore);
      //   });
      // }

      const sort = this.params.sort;
      // const sort = $('input[name="jee-sort"]:checked').attr("ind");
      if (sort === "score") {
        // TODO sorting algorithm
        // data = _.sortBy(_.sortBy(data, "jeeIdx"), d => -1 * d.avgScore);
      }

      data.forEach(datum => {
        datum.tickText = yAxis.tickFormat()(datum.displayName);
      });
      const fakeText = chart
        .selectAll(".fake-text")
        .data(data)
        .enter()
        .append("text")
        .text(d => d.tickText)
        .attr("class", "tick")
        .style("font-size", "12px")
        .each(function(d) {
          d.tickTextWidth = this.getBBox().width;
        });
      fakeText.remove();

      const newHeight = 30 * data.length;
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
      const coreCapacitiesInData = [...new Set(data.map(d => d.attribute))];
      y.domain(coreCapacitiesInData).range([0, newHeight]);
      colorScale.domain([0, maxVal]);
      const bandwidth = y.bandwidth();

      // Get bar group data
      const barGroupData = [];
      coreCapacitiesInData.forEach(attribute => {
        const barGroupDatum = {
          name: attribute,
          children: data.filter(d => d.attribute === attribute)
        };
        barGroupDatum.value = d3.sum(
          barGroupDatum.children,
          d => d[newFlowType]
        );
        barGroupData.push(barGroupDatum);
      });
      this.getRunningValues(barGroupData, newFlowType);

      console.log("barGroupData");
      console.log(barGroupData);

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
        .data(d => d.children.map(c => ({ cc: d.name, country: c })))
        .enter()
        .append("rect")
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
          // legendTitle.text(`Funds disbursed (${Util.money(0).split(' ')[1]})`);
          xLabelPreText = "Disbursed";
        } else {
          // legendTitle.text(`Funds Committed (${Util.money(0).split(' ')[1]})`);
          xLabelPreText = "Committed";
        }
      } else {
        if (newFlowType === "disbursed_funds") {
          //legendTitle.text(`Funds disbursed (${Util.money(0).split(' ')[1]})`);
          xLabelPreText = "Disbursed";
        } else {
          //legendTitle.text(`Funds Committed (${Util.money(0).split(' ')[1]})`);
          xLabelPreText = "Committed";
        }
      }
      xLabel.text(`${xLabelPreText} funds (${Util.money(0).split(" ")[1]})`);
      //chart.select('.axis-label').text('Funds by core capacity');

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
      //
      // yAxisG.selectAll('text').transition().duration(1000).text(function(d) {
      // 	// const readableName = / - (.*)$/.exec(d)[1];
      // 	const readableName = d;
      // 	const shortName = getShortName(readableName);
      // 	return shortName;
      // });

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

      // // Add JEE score icon
      // const jeeColorScale = d3
      //   .scaleThreshold()
      //   .domain([1.5, 2, 2.5, 3, 3.5, 4, 4.5])
      //   .range([
      //     jeeColors[0],
      //     d3.color(jeeColors[1]).darker(0.5),
      //     d3.color(jeeColors[2]).darker(0.5),
      //     d3.color(jeeColors[3]).darker(0.5),
      //     d3.color(jeeColors[4]).darker(0.5),
      //     jeeColors[5],
      //     jeeColors[6]
      //   ]);
      chart
        .selectAll(".y.axis .tick:not(.badged)")
        .each(function addJeeIcons(d) {
          const scoreData = {
            info: core_capacities.find(dd => dd.value === d),
            avgScore: params.jeeScores[d],
            avgScoreRounded: Math.round(params.jeeScores[d]),
            tickTextWidth: 10,
            value: d
          };
          const score = scoreData.avgScore;
          const g = d3.select(this).classed("badged", true);
          const xOffset = -1 * (scoreData.tickTextWidth + 7) - 5 - 5;
          const axisGap = -7;
          const badgeGroup = g
            .append("g")
            .attr("class", "score-badge")
            .attr("transform", `translate(${axisGap}, 0)`)
            .classed("unscored", !showJee);

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
            .style(
              "fill",
              scoreData.avgScoreRounded ? jeeColorScale(score) : "gray"
            )
            .attr("width", badgeDim.width)
            .attr("height", badgeDim.height)
            .attr("rx", badgeDim.rx)
            .attr("x", badgeDim.x)
            .attr("y", badgeDim.y);

          const badgeLabelText =
            scoreData.value === "General IHR" ? "GEN" : scoreData.value;
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
        .attr("y", getYLabelPos(data));
    };
    this.updateStackBar(params.data, params.flowType, {
      jeeScores: params.jeeScores
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
