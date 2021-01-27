// 3rd party libs
import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";

// local components
import Carousel from "./Carousel/Carousel";
import Button from "../../../common/Button/Button";

// styles and assets
import styles from "./crossreferences.module.scss";
import tooltipStyles from "../../../common/tooltip.module.scss";

// constants
export const GOAL_URL = "https://goal.ghscosting.org/";
export const GOAL_API_URL = "https://goal-api.talusanalytics.com/";

const Crossreferences = ({ pathogen, int_refs, hasCaseStudies, hasDons }) => {
  // CONSTANTS //
  const linkSections = [
    {
      text:
        "Click below to be redirected to the Georgetown Outbreak Activity Library (GOAL) to view all case studies related to this pathogen.",
      label: `View all ${pathogen.pathogen_name} case studies`,
      url: "https://goal.ghscosting.org/case-studies",
      show: hasCaseStudies,
    },
    {
      text:
        "Click below to download a complete set of World Health Organization disease outbreak news reports (DONs) related to this event, compiled by the Georgetown Center for Global Health Science and Security. ",
      label: "Download list of DONs for " + pathogen.pathogen_name,
      onClick: () => console.log("clicked"),
      "data-for": "infoTooltip",
      "data-tip": "This feature is currently being developed",
      show: hasDons,
    },
  ];

  const linkSectionsJsx = linkSections
    .filter(d => d.show)
    .map(({ text, label, onClick, url, ...props }) => (
      <div className={styles.linkSection}>
        <p>{text}</p>
        <span {...{ ...props }}>
          <Button {...{ label, onClick, type: "primary", url }} />
        </span>
      </div>
    ));

  // JSX //
  return (
    <>
      <div className={styles.crossreferences}>
        {hasCaseStudies && <Carousel {...{ items: int_refs }} />}
        <div className={styles.linkSections}>{linkSectionsJsx}</div>
      </div>
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"infoTooltip"}
          type="light"
          className={tooltipStyles.tooltip}
          place="top"
          effect="float"
        />
      }
    </>
  );
};
export default Crossreferences;
