import React from "react";
import styles from "./home.module.scss";

// JSX for about page.
const Home = () => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className={styles.home}>
      <div class="left-pane">
        <div class="welcome-container">
          <div class="welcome-text">
            Welcome to the Georgetown Infectious Disease Atlas
          </div>

          <div class="welcome-desc">
            The Georgetown Infectious Disease Atlas (GIDA) maps the flow of
            funding and in-kind support for global health security. Use the
            search bar below to view more details about a funder or recipient's
            activities, or click the buttons above the map on the right to
            explore global funding and capacity.
          </div>
        </div>

        <div class="search-container">
          <div class="search-title">
            View specific country or organization details
          </div>

          <div class="network-country-search search-box">
            <div class="form-group has-feedback">
              <input
                type="text"
                class="country-search-input form-control"
                placeholder="search for a country or organization"
              />
              <i class="glyphicon glyphicon-search form-control-feedback" />
            </div>
            <div class="live-search-results-container">
              <div class="live-search-no-results-text">No results found</div>
              <div class="live-search-results-contents" />
            </div>
          </div>

          <div class="search-buttons">
            <button
              class="talus-btn talus-secondary-btn ghsa-button"
              value="GHSA project details"
            />
          </div>
        </div>
      </div>

      <div class="map-container">
        <div class="map-title">Explore countries on a map</div>

        <div class="map-buttons">
          <button
            class="talus-btn talus-primary-btn"
            value="Funding map"
            data-value="funding"
          />
          <button
            class="talus-btn talus-primary-btn"
            value="JEE score map"
            data-value="jee"
          />
        </div>

        <div class="funding-recipient-map" />
      </div>
    </div>
  );
};

export default Home;
