import React from "react";
import classNames from "classnames";
import styles from "./footer.module.scss";
import talus from "../../../assets/images/logo-talus.png";
import gu from "../../../assets/images/logo-georgetown.png";
import Util from "../../misc/Util.js";

const Footer = ({ ...props }) => {
  const images = [
    {
      imgSrc: gu,
      url: "https://ghss.georgetown.edu/",
      alt: "Georgetown University Center for Global Health Science and Security"
    },
    {
      imgSrc: talus,
      url: "http://talusanalytics.com/",
      alt: "Talus Analytics, LLC"
    }
  ];

  return (
    <div className={classNames(styles.footer, { [styles.dark]: props.isDark })}>
      {
        // <div className={styles.dataAsOf}>
        //   {
        //     'Showing most recent data as of ' + Util.today().toLocaleString('en-US', {
        //       month: 'short',
        //       year: 'numeric',
        //       day: 'numeric',
        //       hour: 'numeric',
        //       minute: 'numeric',
        //       timeZoneName: 'short',
        //     })
        //   }
        // </div>
      }
      <div className={styles.links}>
        {images.map(d => (
          <a target="_blank" href={d.url} alt={d.alt}>
            <img src={d.imgSrc} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default Footer;
