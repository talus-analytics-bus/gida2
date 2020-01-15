import * as d3 from "d3/dist/d3.min";
import Chart from "../chart/Chart.js";
// import Util from "../misc/Util.js";
import styles from "./d3chord.module.scss";

/**
 * Creates a D3.js world map in the container provided
 * @param {String} selector A selector of the container element the map will be placed in
 * @return {Object} An object containing the map and the layer containing drawn items
 */
class D3Chord extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Initialize chart
    this.init();

    // Draw map
    this.draw();

    // // Set map as loaded
    // params.setMapLoaded(true);
  }

  exampleInstanceMethod(data) {}

  draw() {
    console.log("\nDrawing chord.");
  }
}
export default D3Chord;
