import * as d3 from "d3/dist/d3.min";
import Chart from "../../chart/Chart.js";
import Util from "../../misc/Util.js";
import styles from "./d3donut.module.scss";

/**
 * Creates a D3.js world map in the container provided
 * @param {String} selector A selector of the container element the map will be placed in
 * @return {Object} An object containing the map and the layer containing drawn items
 */
class D3Donut extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Define data
    this.params = params;

    // Define margins
    this.margin = {};

    // Initialize chart
    this.init();

    // Set dimensions
    this.width = this.containerwidth;
    this.height = this.containerheight;

    // Draw
    this.draw();
  }

  draw() {
    const tau = 2 * Math.PI;
    //let percSpent = data.total_spent / data.total_committed;

    let numerator = 0;

    // start building the chart
    const margin = { top: 0, right: 10, bottom: 0, left: 10 };
    const outerRadius = 55;
    const innerRadius = 35;

    const chartContainer = this.svg;
    chartContainer
      .classed("progress-circle-chart", true)
      .attr("width", 2 * outerRadius + margin.left + margin.right)
      .attr("height", 2 * outerRadius + margin.top + margin.bottom);
    const chart = this.chart;
    chart.attr(
      "transform",
      `translate(${outerRadius + margin.left}, ${outerRadius + margin.top})`
    );

    // add glow definition
    const defs = chartContainer.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", 3.5)
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0);

    // build components
    chart
      .append("path")
      .datum({ endAngle: tau })
      .style("fill", "#ccc")
      .attr("d", arc);

    const foreground = chart
      .append("path")
      .datum({ endAngle: 0 })
      .style("fill", this.params.color)
      .attr("d", arc);

    // fill middle text
    chart
      .append("text")
      .attr("class", styles["progress-circle-value"])
      .attr("dy", ".35em")
      .classed(styles.zero, this.params.pct === 0)
      .text(
        this.params.pct !== undefined
          ? Util.percentize(100 * this.params.pct)
          : "N/A"
      );

    // animate progress circle filling
    foreground
      .transition()
      .duration(1000)
      .attrTween("d", arcTween(this.params.pct * tau));

    function arcTween(newAngle) {
      return d => {
        const interpolate = d3.interpolate(d.endAngle, newAngle);
        return t => {
          d.endAngle = interpolate(t);
          return arc(d);
        };
      };
    }
  }
}
export default D3Donut;
