import * as d3 from "d3/dist/d3.min";
import { geoNaturalEarth2 } from "d3-geo-projection";
import * as topojson from "topojson-client";
import Chart from "../chart/Chart.js";
import Util from "../misc/Util.js";
import axios from "axios";
import styles from "./worldmap.module.scss";

/**
 * Creates a D3.js world map in the container provided
 * @param {String} selector A selector of the container element the map will be placed in
 * @return {Object} An object containing the map and the layer containing drawn items
 */
class WorldMap extends Chart {
  constructor(selector, params = {}) {
    super(selector, params);

    // Define map selector
    this.mapSelector = selector;

    // Load world JSON data
    axios.get(`${Util.API_URL}/world_json`).then(d => {
      this.world = d.data;
      console.log("\nGetting topo...");
      this.topoworld = topojson.feature(
        this.world,
        this.world.objects.countries
      );
      console.log("Got topo.");

      // Define transform that support map navigation
      this.transform = {
        k: 1,
        x: 0,
        y: 0
      };

      // Define default zoom level of map
      this.zoomLevel = 1;

      // Artificially hide Antarctica
      // TODO at dataset level
      console.log("\nGetting features...");
      this.countryData = this.topoworld.features.filter(
        // d => d.properties.NAME === "France"
        d => d.properties.NAME !== "Antarctica"
      );
      console.log("Got features.");

      // Set data variable
      this.data = undefined;

      // Set class of SVG to include "map"
      // TODO check this
      this.svg.classed("map, true");

      // When the chart is clicked, set stopped to true.
      this.chart.on("click", this.stopped, true);

      // Define margins
      this.margin = {
        top: 30
      };

      // Initialize chart
      this.init();

      // Draw map
      this.draw();

      // Set map as loaded
      params.setMapLoaded(true);
    });
  }

  colorCountries(data) {
    this[styles.countries]
      .selectAll("g")
      .selectAll("." + styles.country)
      .style("fill", "")
      .classed(styles.hatched, false)
      .transition()
      .duration(1000)
      .style("fill", function(d) {
        const match = data.find(dd => dd.id === d.properties.place_id);
        console.log(match);
        if (match !== undefined) {
          // Set hatch if needed
          d3.select(this).classed(
            styles.hatched,
            match.value === "yyy" || match.value === -8888
          );

          // Return color
          return match.color;
        } else return "";
      });
  }

  /**
   * Add hatch definition to display for countries that have made/received
   * contributions as a group only.
   */
  addHatchDefs() {
    const html = `<pattern id="pattern-stripe" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="3.5" height="4" transform="translate(0,0)" fill="lightgray"></rect>
                </pattern>
                <mask id="mask-stripe">
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" />
                </mask>`;
    this.svg.append("defs").html(html);
  }

  draw() {
    this.width = this.containerwidth;
    this.height = this.containerheight;
    this.projection = geoNaturalEarth2()
      .fitSize(
        [this.width, this.height + 60], // The + 60 is to make the main map bigger. Is there a better way?
        this.topoworld
      )
      .precision(0.1);

    this.path = d3.geoPath().projection(this.projection);

    // define zoom
    this.zoom = d3
      .zoom()
      .translateExtent([[0, 0], [this.containerwidth, this.height + 40]])
      .scaleExtent([1, 8])
      .on("zoom", () => this.zoomed()); // need to not overwrite `this`

    this.svg.call(this.zoom);

    this.addOverlay();

    console.log("\nAdding countries...");
    this.addCountries();
    console.log("Added countries.");

    if (this.mapSelector != ".funding-recipient-map") {
      this.addButtons();
    }

    // Add hatch def link
    this.svg.append("use").attr("xlink:href", "#hatchDefs");
  }

  addOverlay() {
    // add overlay: where zoom and pan events are
    this.newGroup(styles.overlay)
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("click", () => this.reset());
  }

  addCountries() {
    const countryGroup = this.newGroup(styles.countries)
      .selectAll("g")
      .data(this.countryData)
      .enter()
      .append("g");

    countryGroup
      .append("path")
      .attr("class", styles.country)
      // .style("fill", "blue")
      .attr("d", d => this.path(d));

    countryGroup
      .append("path")
      .datum(
        topojson.mesh(
          this.world,
          this.world.objects.countries,
          (a, b) => a !== b
        )
      )
      .attr("class", styles.boundary)
      .attr("d", d => this.path(d));
  }

  stopped() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }

  // pan and zoom function
  zoomed() {
    this.zoomLevel = d3.event.transform.k;

    if (this.zoomLevel === 1) {
      d3.event.transform.x = 0;
      d3.event.transform.y = 0;
    }

    this[styles.countries].style(
      "stroke-width",
      `${1.5 / d3.event.transform.k}px`
    );
    this[styles.countries].attr("transform", d3.event.transform);

    this.toggleResetButton();
  }

  zoomIncrementally(value) {
    this.svg
      .transition()
      .duration(600)
      .call(this.zoom.scaleBy, value);
  }

  zoomTo(d) {
    // move country to top of layer
    // $(this.parentNode).append(this);

    // call zoom
    const bounds = this.path.bounds(d);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const s = Math.max(
      1,
      Math.min(8, 0.7 / Math.max(dx / this.width, dy / this.height))
    );
    const t = [this.width / 2 - s * x, this.height / 2 - s * y - 90];
    return this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(t[0], t[1]).scale(s)
      );
  }

  reset() {
    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  update(data) {
    this.data = data;
  }

  addButtons() {
    this.newGroup("buttons");

    this.buttons
      .attr("transform", `translate(${this.params.shiftX || 0}, ${30 + 25})`)
      .style("font-family", "Open Sans, sans-serif");

    this.addResetButton();
    this.addZoomButtons();
  }

  addResetButton() {
    this.newGroup("resetButton", this.buttons);

    const resetWidth = 50;
    const resetHeight = 25;

    this.buttons.resetButton
      .attr("transform", `translate(40, ${this.height - 61})`)
      .style("visibility", "hidden");

    this.buttons.resetButton
      .append("rect")
      .attr("width", resetWidth)
      .attr("height", resetHeight)
      .attr("fill", "#ffffff")
      .attr("fill-opacity", 0.9)
      .attr("rx", 3)
      .attr("ry", 3)
      .style("stroke", "black")
      .style("stroke-opacity", 0.6);

    this.buttons.resetButton
      .append("text")
      .attr("transform", `translate(6, ${resetHeight / 2 + 5})`)
      .text("Reset");

    this.buttons.resetButton.style("cursor", "pointer").on("click", () => {
      this.reset();
    });
  }

  toggleResetButton() {
    if (this.mapSelector == ".funding-recipient-map") {
      return;
    }

    if (this.zoomLevel > 1) {
      this.buttons.resetButton.style("visibility", "visible");
    } else {
      this.buttons.resetButton.style("visibility", "hidden");
    }
  }

  addZoomButtons() {
    this.newGroup("zoomButtons", this.buttons);

    const width = 25;
    const height = 50;

    this.buttons.zoomButtons
      .attr("transform", `translate(5, ${this.height - height - 36})`)
      .style("cursor", "pointer");

    this.buttons.zoomButtons
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", "white")
      .attr("fill-opacity", 0.9)
      .style("stroke", "black")
      .style("stroke-opacity", 0.6);

    this.buttons.zoomButtons
      .append("rect")
      .attr("y", height / 2)
      .attr("width", width)
      .attr("height", 1)
      .attr("fill", "black")
      .attr("fill-opacity", 0.6);

    this.newGroup("zoomIn", this.buttons.zoomButtons);
    const zoomIn = this.buttons.zoomButtons.zoomIn;

    this.newGroup("zoomOut", this.buttons.zoomButtons);
    const zoomOut = this.buttons.zoomButtons.zoomOut;

    // https://stackoverflow.com/questions/25969496/d3-js-append-a-span-with-glyphicon-class
    const zoomInButton = zoomIn
      .append("svg:foreignObject")
      .attr("width", width)
      .attr("height", width)
      .style("text-align", "center")
      .append("xhtml:span")
      .style("vertical-align", "middle")
      .attr("class", "control glyphicon glyphicon-plus");

    zoomInButton.on("click", () => {
      this.zoomIncrementally(1.75);
    });

    const zoomOutButton = zoomOut
      .attr("transform", `translate(0, ${0.5 * height})`)
      .append("svg:foreignObject")
      .style("text-align", "center")
      .attr("width", width)
      .attr("height", width)
      .append("xhtml:span")
      .style("vertical-align", "middle")
      .attr("class", "control glyphicon glyphicon-minus");

    zoomOutButton.on("click", () => {
      this.zoomIncrementally(0.5);
    });
  }
}
export default WorldMap;
