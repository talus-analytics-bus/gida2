import React from "react";
import classNames from "classnames";
import {Search} from "../../common";
import styles from "./home.module.scss";
import {Button} from "../../common";
import mapImage from "../../../assets/images/map.png";
import {GhsaButton} from "../../common";

// JSX for home page
const Home = () => {
  return (
    <div className={classNames(styles.home, "pageContainer")}>
      <div className={styles.leftPane}>
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeText}>
            Welcome to the <br />
            Georgetown Global Health Security Tracking site
          </div>

          <div className={styles.welcomeDesc}>
            <p>
              The International Disease and Events Analysis (IDEA) Global Health
              Security Tracking site maps the flow of funding and in-kind
              support for global health security. Use the search bar below to
              view more details about a funder or recipient's activities, or
              click the buttons above the map on the right to explore global
              funding and capacity.
            </p>
            <p className={styles.instructions}>
              Note: This tool is designed to be used in Google Chrome or Mozilla
              Firefox.
            </p>
          </div>
        </div>
        <GhsaButton {...{ active: false, isDark: false }} />
        <div className={styles.searchContainer}>
          <div className={styles.title}>
            View specific country or
            <br /> organization details
          </div>
          <div className={styles.content}>
            <Search
              top={false}
              name={"home"}
              expandedDefault={true}
              limit={3}
            />
          </div>
        </div>
      </div>
      <div className={styles.rightPane}>
        <div className={styles.title}>Recipients by country</div>
        <div className={styles.content}>
          <div className={styles.buttons}>
            <Button
              linkTo={"/map"}
              type={"primary"}
              label={"View funding map"}
            />
            <Button
              linkTo={"/map?supportType=jee"}
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
  )
}

export default Home
