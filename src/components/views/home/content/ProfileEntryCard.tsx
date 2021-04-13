import React from "react"

// local components
import { EntryCard } from "../EntryCard/EntryCard"
import { SlideUp } from "../../../common"

// assets and styles
import svgSrc from "./images/funder-recipient.svg"
import { Search, GhsaButton } from "../../../common"

/**
 * Home page entry point for accessing funder/recipient profiles.
 */
const ProfileEntryCard = () => {
  return (
    <SlideUp delayFactor={10}>
      <EntryCard
        {...{
          graphic: (
            <img
              src={svgSrc}
              alt={"Interlocking funder and recipient symbols"}
            />
          ),
          title: "Funder and recipient profiles",
          description:
            "See a country or organization’s funding history on their profile.",
          actions: [
            <Search
              {...{
                callback: undefined,
                sDark: false,
                name: "home",
                expandedDefault: true,
                wide: true,
                includePheics: false,
              }}
            />,
            <GhsaButton />,
          ],
          className: undefined,
        }}
      />
    </SlideUp>
  )
}

export default ProfileEntryCard
