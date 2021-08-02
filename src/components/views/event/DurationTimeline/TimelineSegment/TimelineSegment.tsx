import React from "react"
import { renderToString } from "react-dom/server"
import { Popup } from "../../../../common"
import { formatDate } from "../../../../misc/Util"
import styles from "./timelinesegment.module.scss"
type TimelineSegmentProps = {
  title: string
  value: string
  children: any
  style: object
}
export const TimelineSegment = ({
  title,
  value,
  style,
  children,
}: TimelineSegmentProps) => {
  // CONSTANTS //
  // formatted date
  // const dateStr = formatDate(new Date(date))
  const dataHtml = renderToString(
    <Popup
      {...{
        header: [
          {
            title,
            label: "calendar",
          },
        ],
        body: [
          {
            field: "Dates",
            value,
          },
        ],
        style: {
          gridTemplateColumns: "40px auto",
        },
        popupStyle: {
          minWidth: "unset",
        },
      }}
    />,
  )
  return (
    <div className={styles.timelineSegment}>
      <div
        style={style}
        className={styles.popupZone}
        data-html
        data-tip={dataHtml}
        data-for={"segmentTip"}
      >
        {children}
      </div>
    </div>
  )
}
