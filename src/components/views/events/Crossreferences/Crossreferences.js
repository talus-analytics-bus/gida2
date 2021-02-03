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
export const GOAL_URL = process.env.REACT_APP_GOAL_URL;
export const GOAL_API_URL = "https://goal-api.talusanalytics.com/";

const Crossreferences = ({
  id,
  pathogen,
  int_refs,
  hasCaseStudies,
  hasDons,
}) => {
  // STATE //
  const [goalAgentName, setGoalAgentName] = useState(null);

  // CONSTANTS //
  const linkSections = [
    {
      text:
        "Click below to be redirected to the Georgetown Outbreak Activity Library (GOAL) to view all case studies related to this pathogen.",
      label: `View all ${pathogen.pathogen_name} case studies`,
      wrapper: children => <>{children}</>,
      url: `${GOAL_URL}/case-studies?agent=${goalAgentName}`,
      show: hasCaseStudies && goalAgentName !== null,
    },
    {
      text:
        "Click below to download a complete set of World Health Organization disease outbreak news reports (DONs) related to this event, compiled by the Georgetown Center for Global Health Science and Security. ",
      label: "Download list of DONs for " + pathogen.pathogen_name,
      wrapper: children => (
        <form
          action={`${
            process.env.REACT_APP_API_URL
          }/post/export_dons?event_id=${id}`}
          method="POST"
        >
          {children}
        </form>
      ),
      show: hasDons,
    },
  ];

  const linkSectionsJsx = linkSections
    .filter(d => d.show)
    .map(({ text, label, onClick, url, wrapper, ...props }) =>
      wrapper(
        <div className={styles.linkSection}>
          <p>{text}</p>
          <span {...{ ...props }}>
            <Button {...{ label, onClick, type: "primary", url }} />
          </span>
        </div>
      )
    );

  // JSX //
  return (
    <>
      <div className={styles.crossreferences}>
        {hasCaseStudies && (
          <Carousel {...{ items: int_refs, setGoalAgentName }} />
        )}
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
