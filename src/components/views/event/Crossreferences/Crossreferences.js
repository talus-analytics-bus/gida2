// 3rd party libs
import React, { useState, useEffect } from "react"
import ReactTooltip from "react-tooltip"

// local components
import Carousel from "./Carousel/Carousel"
import { Button } from "../../../common"
import { Excel } from "../../../misc/Queries"

// styles and assets
import styles from "./crossreferences.module.scss"
import tooltipStyles from "../../../common/tooltip.module.scss"

// constants
export const GOAL_URL = process.env.REACT_APP_GOAL_URL
export const GOAL_API_URL = "https://goal-api.talusanalytics.com/"

const Crossreferences = ({
  id,
  name,
  pathogen,
  int_refs,
  hasCaseStudies,
  hasDons,
}) => {
  // STATE //
  const [goalAgentName, setGoalAgentName] = useState(null)

  // CONSTANTS //
  const linkSections = [
    {
      text:
        "Click below to be redirected to the Georgetown Outbreak Activity Library (GOAL) to view all case studies related to this pathogen.",
      iconName: "open_in_new",
      label: `Go to GOAL ${pathogen.pathogen_name} case studies`,
      url: `${GOAL_URL}/case-studies?agent=${goalAgentName}`,
      show: hasCaseStudies && goalAgentName !== null,
    },
    {
      text:
        "Click below to download a complete set of World Health Organization disease outbreak news reports (DONs) related to this PHEIC, compiled by the Georgetown Center for Global Health Science and Security. ",
      label: "Download list of DONs for " + name,
      iconName: "file_download",
      onClick: () => {
        Excel({
          method: "post",
          filename: "GHS Tracking - DONs Data for " + name,
          isDONs: true,
          data: {},
          params: { event_id: id },
        })
      },
      show: hasDons,
    },
  ]

  const linkSectionsJsx = linkSections
    .filter(d => d.show)
    .map(({ text, label, iconName, onClick, url, wrapper, ...props }) => (
      <div className={styles.linkSection}>
        <p>{text}</p>
        <span {...{ ...props }}>
          <Button
            {...{
              label,
              onClick,
              type: "primary",
              url,
              iconName,
              sameWindow: false,
            }}
          />
        </span>
      </div>
    ))

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
  )
}
export default Crossreferences
