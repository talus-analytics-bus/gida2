// 3rd party libs
import React, { useState, useEffect } from "react";

// local components
import Carousel from "./Carousel/Carousel";
import Button from "../../../common/Button/Button";

// styles and assets
import styles from "./crossreferences.module.scss";

// constants
export const GOAL_URL = "https://goal.ghscosting.org/";
export const GOAL_API_URL = "https://goal-api.talusanalytics.com/";

const Crossreferences = ({ pathogen }) => {
  // CONSTANTS //
  const linkSections = [
    {
      text:
        "Click below to be redirected to the Georgetown Outbreak Activity Library (GOAL) to view all case studies related to this pathogen.",
      label: `View all ${pathogen.pathogen_name} case studies`,
      onClick: () => console.log("click!"),
    },
    {
      text:
        "Click below to download a complete set of World Health Organization disease outbreak news reports (DONs) related to this event, compiled by the Georgetown Center for Global Health Science and Security. ",
      label: "Download list of DONs for " + pathogen.pathogen_name,
      onClick: () => console.log("click!"),
    },
  ];

  const linkSectionsJsx = linkSections.map(({ text, label, onClick }) => (
    <div className={styles.linkSection}>
      <p>{text}</p>
      <Button {...{ label, onClick, type: "primary" }} />
    </div>
  ));

  // JSX //
  return (
    <div className={styles.crossreferences}>
      <Carousel {...{ pathogen }} />
      <div className={styles.linkSections}>{linkSectionsJsx}</div>
    </div>
  );
};
export default Crossreferences;
