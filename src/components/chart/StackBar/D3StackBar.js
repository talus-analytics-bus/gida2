import * as d3 from "d3/dist/d3.min";
import Chart from "../../chart/Chart.js";
import styles from "./d3stackbar.module.scss";

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

    // Initialize chart
    this.init();

    // Set dimensions
    this.width = this.containerwidth;
    this.height = this.containerheight;

    // Draw map
    this.draw();
  }

  draw() {}

  getRunningValues(data, selected) {
    data
      .map(d => {
        let runningValue = 0;
        d.children = d3.shuffle(
          d.children.map(c => {
            c.value0 = runningValue;
            runningValue += c[selected];
            c.value1 = runningValue;
            return c;
          })
        );
        return d;
      })
      .sort((a, b) => a[selected] > b[selected]);
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
