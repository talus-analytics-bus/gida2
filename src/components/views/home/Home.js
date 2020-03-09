import React from "react";
import classNames from "classnames";
import Search from "../../common/Search/Search.js";
import styles from "./home.module.scss";
import Button from "../../common/Button/Button.js";
import mapImage from "../../../assets/images/map.png";

// JSX for about page.
const Home = () => {
  return (
    <div className={classNames(styles.home, "pageContainer")}>
      <div className={styles.leftPane}>
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeText}>
            Welcome to the Georgetown Global Health Security Tracking site
          </div>

          <div className={styles.welcomeDesc}>
            <p>
              The Georgetown Infectious Disease Atlas (GIDA) Global Health
              Security Tracking site maps the flow of funding and in-kind
              support for global health security. Use the search bar below to
              view more details about a funder or recipient's activities, or
              click the buttons above the map on the right to explore global
              funding and capacity.
            </p>
            <p className={styles.instructions}>
              This site is designed to be used in Chrome or Firefox desktop
              browsers.
            </p>
          </div>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.title}>
            View specific country or organization details
          </div>
          <div className={styles.content}>
            <Search name={"home"} expandedDefault={true} />
          </div>
        </div>
      </div>
      <div className={styles.rightPane}>
        <div className={styles.title}>Recipients by country</div>
        <div className={styles.content}>
          <div className={styles.buttons}>
            <Button
              linkTo={"/explore/map"}
              type={"primary"}
              label={"View funding map"}
            />
            <Button
              linkTo={"/explore/map?supportType=jee"}
              type={"primary"}
              label={"View JEE score map"}
            />
          </div>
          <div className={styles.map}>
            <img src={mapImage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
