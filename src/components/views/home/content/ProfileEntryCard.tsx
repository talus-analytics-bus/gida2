import React, { useState, useContext } from "react"
import { Redirect } from "react-router-dom"

// local components
import { EntryCard } from "../EntryCard/EntryCard"
import Selectpicker from "../../../chart/Selectpicker/Selectpicker"

// assets and styles
import svgSrc from "./images/funder-recipient.svg"
import { Search, GhsaButton } from "../../../common"

/**
 * Home page entry point for accessing funder/recipient profiles.
 */
const ProfileEntryCard = () => {
  return (
    <EntryCard
      {...{
        graphic: (
          <img src={svgSrc} alt={"Interlocking funder and recipient symbols"} />
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
  )
}

export default ProfileEntryCard
