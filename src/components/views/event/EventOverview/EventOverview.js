// 3rd party libs
import React from "react"
import styles from "./eventoverview.module.scss"

// local components
// common components
import { DurationTimeline, EventNumberTotals, Disclaimer } from ".."
import SourceText, { WebsiteList } from "../../../common/SourceText/SourceText"

// utility
import { NONE_VALS } from "../../../misc/Util"

const EventOverview = ({
  // event attributes from database
  id,
  name,
  slug,
  desc,
  desc_refs,
  start,
  start_desc,
  end,
  end_desc,
  was_pheic,
  pheic_start,
  pheic_end,
  case_data_id,
  death_data_id,
  cases_and_deaths_json,
  cases_and_deaths_refs,

  // additional params.
  afterCaseData,
  caseData,
  setCaseData,
  deathData,
  setDeathData,
}) => {
  // FUNCTIONS //
  const getTimelinePoints = () => {
    const pheicPoints = []
    if (was_pheic) {
      pheicPoints.push({
        date: pheic_start,
        desc: "WHO declared PHEIC",
        type: "pheic_start",
      })
      pheicPoints.push({
        date: pheic_end,
        desc: "WHO lifted PHEIC",
        type: "pheic_end",
      })
    }
    const validPoints = [
      { date: start, desc: start_desc, type: "start" },
      { date: end, desc: end_desc, type: "end" },
    ]
      .concat(pheicPoints)
      .filter(d => !NONE_VALS.includes(d.date))
    return validPoints
  }

  const getIsOngoing = ps => {
    return !ps.some(d => d.type === "end")
  }

  // CONSTANTS //
  const points = getTimelinePoints()
  const isOngoing = getIsOngoing(points)
  const showDesc = !NONE_VALS.includes(desc)
  const hasDescDataSources = desc_refs.length > 0
  const descDataSourcesNoun = desc_refs.length === 1 ? "Source" : "Sources"
  const linksOnly = false
  // JSX //
  return (
    <div className={styles.eventOverview}>
      <div className={styles.name}>{name}</div>
      {showDesc && (
        <p className={styles.desc}>
          {desc.split("\n").map(d => (
            <p>{d}</p>
          ))}
          {hasDescDataSources && (
            <SourceText>
              <span style={{ fontWeight: 600 }}>
                {descDataSourcesNoun}
                {linksOnly ? ": " : ""}
              </span>
              <WebsiteList
                {...{
                  websites: desc_refs,
                  linksOnly,
                }}
              />
            </SourceText>
          )}
        </p>
      )}
      <Disclaimer eventSlug={slug} />
      <DurationTimeline
        {...{
          points: points.filter(d => d.type.startsWith("pheic")),
          isOngoing,
        }}
      />
      <EventNumberTotals
        {...{
          type: "funding",
          eventData: { id },
        }}
      />
      <EventNumberTotals
        {...{
          type: "impacts",
          eventData: {
            case_data_id,
            death_data_id,
            cases_and_deaths_json,
            cases_and_deaths_refs,
          },
          afterCaseData,
          caseData,
          setCaseData,
          deathData,
          setDeathData,
        }}
      />
    </div>
  )
}
export default EventOverview
