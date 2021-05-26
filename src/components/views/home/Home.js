import ProfileEntryCard from "./content/ProfileEntryCard"
import FundingMapEntryCard from "./content/FundingMapEntryCard"
import JeeMapEntryCard from "./content/JeeMapEntryCard"
import React from "react"
import classNames from "classnames"
import styles from "./home.module.scss"
import { EntryCardSet } from "./EntryCardSet/EntryCardSet"

// JSX for home page
const Home = () => {
  // JSX
  return (
    <div className={classNames(styles.home, "pageContainer")}>
      <h1>Georgetown Global Health Security Tracking</h1>
      <Introduction />
      <EntryCardSet>
        <ProfileEntryCard />
        <FundingMapEntryCard />
        <JeeMapEntryCard />
      </EntryCardSet>
    </div>
  )
}

export default Home

function Introduction() {
  return (
    <div className={styles.introduction}>
      <p>
        The International Disease and Events Analysis (IDEA) Global Health
        Security Tracking site
        <br />
        maps the flow of funding and in-kind support for global health security.
      </p>
      <p>
        <em>
          Note: This tool is designed to be used in Google Chrome or Mozilla
          Firefox.
        </em>
      </p>
    </div>
  )
}
