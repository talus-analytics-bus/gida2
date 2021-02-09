import React from "react";
import classNames from "classnames";
import styles from "./footer.module.scss";
import moment from "moment";
import talus from "../../../assets/images/logo-talus.png";
import talusDark from "../../../assets/images/logo-talus-dark.png";
import gu from "../../../assets/images/logo-georgetown.png";
import guDark from "../../../assets/images/logo-georgetown-dark.png";
import idea from "../../../assets/images/logo-title.png";
import ideaDark from "../../../assets/images/logo-idea-dark.png";
import Util, { getLastUpdatedDate } from "../../misc/Util.js";

const Footer = ({ versionData, ...props }) => {
  // CONSTANTS //
  // get last updated date for assistance data
  const lastedUpdatedDateStr = getLastUpdatedDate({
    versionType: "assistance",
    data: versionData,
  });
  const images = [
    {
      imgSrc: props.isDark ? ideaDark : idea,
      url: "https://ghssidea.org",
      alt: "International Disease and Events Analysis",
    },
    {
      imgSrc: props.isDark ? guDark : gu,
      url: "https://ghss.georgetown.edu/",
      alt:
        "Georgetown University Center for Global Health Science and Security",
    },
    {
      imgSrc: props.isDark ? talusDark : talus,
      url: "http://talusanalytics.com/",
      alt: "Talus Analytics, LLC",
    },
  ];

  return (
    <div
      className={classNames(styles.footer, {
        [styles.dark]: props.isDark,
        [styles.wide]: props.isWide,
      })}
    >
      <div className={styles.content}>
        <div className={styles.links}>
          {images.map(d => (
            <a
              target="_blank"
              href={d.url}
              className={
                d.alt == "Talus Analytics, LLC" ? styles.talusLogo : null
              }
            >
              <img src={d.imgSrc} alt={d.alt} />
              {d.alt == "Talus Analytics, LLC" && (
                <div className={styles.builtBy}>Built by</div>
              )}
            </a>
          ))}
        </div>
        {lastedUpdatedDateStr && (
          <div className={styles.dataAsOf}>
            Data last updated {lastedUpdatedDateStr}
          </div>
        )}
      </div>
    </div>
  );
};

export default Footer;
