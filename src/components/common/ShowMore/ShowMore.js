// standard packages
import React, { useState } from "react"

// assets and styles
import { styles, toggle } from "./showmore.module.scss"

/**
 * @method ShowMore
 * Display up to a certain number of characters / words with "read more"
 * button to display more of them optionally.
 */
export const ShowMore = ({ text = "", charLimit = 30 }) => {
  // true if "read more" is fully opened, false otherwise
  const [expanded, setExpanded] = useState(false)
  if (text === null) return null

  // message of "read more" button
  const label = expanded ? "show less" : "show more"

  // text to show
  const textShortEnough = text.length < charLimit
  const textToShow = textShortEnough
    ? text
    : getText({
        text,
        expanded,
        charLimit,
      })

  return (
    <span className={styles}>
      {textToShow}{" "}
      <span
        onClick={e => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}
        className={toggle}
      >
        {!textShortEnough && label}
      </span>
    </span>
  )
}

/**
 * Return full text if expanded or shortened text with ellipsis if not and its
 * too long.
 * @method getText
 * @param  {[type]} text      [description]
 * @param  {[type]} expanded  [description]
 * @param  {[type]} charLimit [description]
 * @return {[type]}           [description]
 */
const getText = ({ text, expanded, charLimit }) => {
  if (expanded) return text
  else {
    const words = text.split(" ")
    let shortText = ""
    for (let i = 0; i < words.length; i++) {
      const wouldBeTooLong = (shortText + words[i]).length > charLimit
      if (wouldBeTooLong) break
      else shortText += " " + words[i]
    }
    return shortText + "..."
  }
}

export default ShowMore
