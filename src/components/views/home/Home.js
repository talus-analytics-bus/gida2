import React from "react";
import classNames from "classnames";
import Search from "../../common/Search/Search.js";
import styles from "./home.module.scss";

// JSX for about page.
const Home = () => {
  return (
    <div className={classNames(styles.home, "pageContainer")}>
      <div className={styles.leftPane}>
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeText}>
            Welcome to the Georgetown Infectious Disease Atlas
          </div>

          <div className={styles.welcomeDesc}>
            The Georgetown Infectious Disease Atlas (GIDA) maps the flow of
            funding and in-kind support for global health security. Use the
            search bar below to view more details about a funder or recipient's
            activities, or click the buttons above the map on the right to
            explore global funding and capacity.
          </div>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchTitle}>
            View specific country or organization details
          </div>

          <Search expandedDefault={true} />

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
