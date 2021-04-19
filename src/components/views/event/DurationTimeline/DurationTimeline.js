// 3rd party libs
import React, { useEffect } from "react"
import ReactTooltip from "react-tooltip"
import moment from "moment"
import * as d3 from "d3/dist/d3.min"

// styles and assets
import styles from "./durationtimeline.module.scss"
import { popupStyles } from "../../../common"
import arrowSvg from "./svg/arrow.svg"

// utility
import { floatToPctString, formatDate } from "../../../misc/Util"

// local components
import Dot from "./Dot/Dot"
import { TimelineSegment } from "./TimelineSegment/TimelineSegment"

const DurationTimeline = ({ points, isOngoing }) => {
  // convert string dates into moments
  points.forEach(p => (p.m = moment(p.date)))

  // get min and max
  const minTmp = getMin(points)
  const maxTmp = getMax(points)
  const [min, max] = adjustMinMax(minTmp, maxTmp)

  // define timeline bounds
  const left = moment(min).startOf("year")

  const getRightLimit = (isOngoing, max) => {
    return moment(max).endOf("year")
  }
  const right = getRightLimit(isOngoing, max)

  // define relative positions of dots
  const den = right - left
  const getRelPos = (p, l) => {
    const num = p.m - left
    return 100.0 * (num / den)
  }

  // get timeline data from points
  const getTimelineDataFromPoints = ps => {
    ps.forEach(p => {
      const x = getRelPos(p, left)
      p.x = x
      p.left = floatToPctString(x)
    })

    const getMidOfYear = y => {
      const m = moment(`${y}-01-01`)
      const s = m
      const e = moment(m).endOf("year")
      const mid = moment(s).add((e - s) / 2)
      return mid
    }

    const getYearsFromPoints = (ps, l) => {
      const ysData = ps.map(p => p.m.year())
      if (isOngoing) ysData.push(moment().year())
      const ysTmp = [...new Set(ysData)].sort()

      // fill in any missing years
      const ys = []
      let prvY = ysTmp[0] - 1
      ysTmp.forEach(y => {
        if (y === prvY - 1) {
          ys.push(y)
          return
        } else {
          while (prvY < y) {
            ys.push(prvY + 1)
            prvY = prvY + 1
          }
        }
      })

      // if there is one year, add one in the future and one in the past
      // if two, add one in the future
      const nYs = ys.length
      if (nYs === 1) {
        ys.unshift(ys[0] - 1)
        ys.push(ys[1] + 1)
      } else if (nYs === 2) {
        ys.push(ys[1] + 1)
      }

      const ms = ys.map(y => getMidOfYear(y))
      const yls = ms.map(m => {
        const x = getRelPos({ m }, l)
        return {
          x,
          left: floatToPctString(x),
          l: m.year().toString(),
          m: m,
        }
      })
      return yls
    }

    const getTicksFromYears = (ys, l) => {
      const ts = []
      ys.forEach((y, i) => {
        const x1 = getRelPos({ m: moment(y.m).startOf("year") }, l)
        ts.push(floatToPctString(x1))
        if (i === ys.length - 1) {
          const x2 = getRelPos({ m: moment(y.m).endOf("year") }, l)
          ts.push(floatToPctString(x2))
        }
      })
      return ts
    }

    const ys = getYearsFromPoints(ps, left)
    const ts = getTicksFromYears(ys, left)

    // sort points by descending date
    ps.sort(function(a, b) {
      if (a.m > b.m) return 1
      else if (a.m < b.m) return -1
      else return 0
    })

    return [ps, ys, ts]
  }

  // FUNCTION CALLS //
  // get dot positions
  const [dots, years, ticks] = getTimelineDataFromPoints(points)

  const getThickStartEndFromPoints = (ps, r) => {
    // has event ended?
    if (ps.length === 0) return [0, 0]
    else {
      const [s, e] = [ps[0].x, ps[ps.length - 1].x]
      const l = !isOngoing ? e - s : r - s
      const w = floatToPctString(l)
      // const arrowStart = floatToPctString(l + s)
      return [floatToPctString(s), w]
    }
  }
  const [thickStart, thickWidth] = getThickStartEndFromPoints(
    dots,
    getRelPos({ m: moment() }, left),
  )

  // EFFECTS //
  // rebuild tooltips on load
  useEffect(ReactTooltip.rebuild, [dots])

  // JSX //
  return (
    <>
      <div className={styles.durationTimeline}>
        <div className={styles.title}>Timeline</div>
        <div className={styles.track}>
          <div className={styles.ticks}>
            {ticks.map(t => (
              <div style={{ left: t.left }} className={styles.tick} />
            ))}
          </div>
          <TimelineSegment
            {...{
              title: "WHO PHEIC declaration",
              value: getSegmentValue(points),
              style: { left: thickStart, width: thickWidth },
            }}
          >
            <div className={styles.thickTrack} />
            {isOngoing && (
              <>
                <div className={styles.ongoingLabel}>Ongoing</div>
                <img
                  style={{ left: "100%" }}
                  src={arrowSvg}
                  className={styles.arrow}
                  alt={"Arrow head"}
                />
              </>
            )}
            <div className={styles.dots}>
              {dots.map((d, i) => (
                <Dot
                  {...{
                    left: i === 0 ? 0 : undefined,
                    right: i === 0 ? undefined : 0,
                    key: d.date,
                  }}
                />
              ))}
            </div>
          </TimelineSegment>
        </div>
        <div className={styles.years}>
          {years.map(t => (
            <div style={{ left: t.left }} className={styles.year}>
              {t.l}
            </div>
          ))}
        </div>
      </div>
      {
        // Info tooltip that is displayed whenever hovering on timeline (dot
        // or track)
        <ReactTooltip
          id={"segmentTip"}
          class={popupStyles.container}
          type="light"
          effect="float"
          place="top"
          delayHide={250}
          clickable={false}
        />
      }
    </>
  )
}
export default DurationTimeline

function getMin(points) {
  return moment(d3.min(points, p => p.m))
}

function getMax(points) {
  return moment(d3.max(points, p => p.m))
}

function adjustMinMax(min, max) {
  const sameDate = max.isSame(min, "date")
  if (!sameDate) {
    const sameYear = max.isSame(min, "year")
    const consecYears = Math.abs(max.year() - min.year()) === 1
    if (sameYear) {
      max.add(1, "year")
      min.subtract(1, "year")
    } else if (consecYears) {
      max.add(1, "year")
    }
  } else {
    max = moment()
    const addYear = moment().year() - min.year() < 3
    if (addYear) max.add(1, "year")
  }
  return [min, max]
}

const getSegmentValue = ps => {
  if (ps.length === 0) return "Unknown"
  else {
    const startStr = formatDate(new Date(ps[0].date))
    if (ps.length === 1) {
      return `${startStr} - present`
    } else {
      const endStr = formatDate(new Date(ps[ps.length - 1].date))
      return `${startStr} - ${endStr}`
    }
  }
}
