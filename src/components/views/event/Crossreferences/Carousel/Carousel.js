// 3rd party libs
import React, { useState, useEffect } from "react"
import classNames from "classnames"

// styles and assets
import styles from "./carousel.module.scss"

// local components
import { GOAL_URL } from "../Crossreferences"
import { GOALCaseStudies, execute } from "../../../../misc/Queries"

const Carousel = ({ items, setGoalAgentName }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false)
  const [idx, setIdx] = useState(null)
  const [data, setData] = useState(null)

  // CONSTANTS //
  const item = idx !== null && data[idx] !== undefined ? data[idx] : {}
  const imgSrc =
    item.images !== undefined ? `${item.images[0].fn}` : null

  // FUNCTIONS //
  const getData = async () => {
    const ids = items.map(d => d.goal_case_study_id)
    const queries = { data: GOALCaseStudies() }
    const results = await execute({ queries })
    const newData = results.data.filter(d => ids.includes(d.id))
    setData(newData)
    setGoalAgentName(newData[0].agent)
    setIdx(0)
    setLoaded(true)
  }

  const getLink = (children, isText = false) => {
    return (
      <a
        target="_blank"
        href={`https://goal.ghscosting.org/case-studies/${
          item.id
        }?from=case-studies`}
      >
        {isText && (
          <i key={item.id} className={"material-icons"}>
            open_in_new
          </i>
        )}
        {children}
      </a>
    )
  }

  // EFFECT HOOKS //
  // get case study data on initial render
  useEffect(() => {
    if (data === null) getData()
  }, [])

  // JSX //
  return (
    <div className={styles.carousel}>
      <div className={styles.card}>
        <div className={styles.title}>{getLink(item.title, true)}</div>
        <div className={styles.image}>
          {getLink(
            <img src={imgSrc} alt={"Image representing a case study"} />,
          )}
        </div>
        <div className={styles.toggler}>
          {loaded &&
            data.map((d, i) => (
              <div
                onClick={() => setIdx(i)}
                className={classNames(styles.circle, {
                  [styles.selected]: i === idx,
                })}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
export default Carousel
