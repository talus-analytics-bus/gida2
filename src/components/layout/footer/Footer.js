import React from "react";
import classNames from "classnames";
import styles from "./footer.module.scss";
import talus from "../../../assets/images/logo-talus.png";
import talusDark from "../../../assets/images/logo-talus-dark.png";
import gu from "../../../assets/images/logo-georgetown.png";
import guDark from "../../../assets/images/logo-georgetown-dark.png";
import Util from "../../misc/Util.js";

const Footer = ({ ...props }) => {
  const images = [
    {
      imgSrc: props.isDark ? guDark : gu,
      url: "https://ghss.georgetown.edu/",
      alt: "Georgetown University Center for Global Health Science and Security"
    },
    {
      imgSrc: props.isDark ? talusDark : talus,
      url: "http://talusanalytics.com/",
      alt: "Talus Analytics, LLC"
    }
  ];

  return (
    <div
      className={classNames(styles.footer, {
        [styles.dark]: props.isDark,
        [styles.wide]: props.isWide
      })}
    >
      <div className={styles.content}>
        {
          <div className={styles.dataAsOf}>
            {"Data last updated " +
              Util.lastUpdated().toLocaleString("en-US", {
                month: "short",
                year: "numeric",
                day: "numeric"
              })}
          </div>
        }
        <div className={styles.links}>
          {images.map(d => (
            <a target="_blank" href={d.url} alt={d.alt}>
              <img src={d.imgSrc} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
