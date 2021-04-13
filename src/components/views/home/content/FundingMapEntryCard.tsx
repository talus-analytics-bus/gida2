import React, { useState, useContext } from "react"
import { Redirect } from "react-router-dom"

// local components
import { EntryCard } from "../EntryCard/EntryCard"
import Selectpicker from "../../../chart/Selectpicker/Selectpicker"

// assets and styles
import styles from "./pheicentrycard.module.scss"
import pngSrc from "./images/funding-map.png"
import { Button } from "../../../common"

/**
 * Home page entry point for accessing funding maps.
 */
const FundingMapEntryCard = () => {
  return (
    <EntryCard
      {...{
        graphic: (
          <img
            style={{ height: 80 }}
            src={pngSrc}
            alt={
              "Map of countries shaded in purple with higher-funding darker purple"
            }
          />
        ),
        title: "Funding map",
        className: undefined,
        description:
          "Track global health security funding by funder or recipient country.",
        actions: [
          <Button
            {...{
              type: "primary",
              label: "View funding map",
              linkTo: "/map",
              url: undefined,
              disabled: false,
              iconName: null,
            }}
          />,
        ],
      }}
    />
  )
}

export default FundingMapEntryCard

/**
 * Show list of PHEICs to choose from, by default, "Select a PHEIC is shown."
 * When a choice is made, the browser navigates to that PHEIC's page.
 */
const PheicSelectpicker = ({ outbreaks }: any) => {
  const [redirect, setRedirect] = useState<any | null>(null)
  const defaultOptions = [
    { value: "", label: "Select a PHEIC", disabled: true },
  ]
  if (redirect) return redirect
  else
    return (
      <div className={styles.dropdowns}>
        <Selectpicker
          {...{
            label: "",
            curSelection: "",
            setOption: (v: string) => {
              setRedirect(
                <Redirect to={"/events/" + v} from={"/"} push={true} />,
              )
            },
            optionList: defaultOptions.concat(
              outbreaks.map(({ slug, name }: any) => {
                return { value: slug, label: name }
              }),
            ),
            optionGroups: undefined,
            allOption: false,
          }}
        />
      </div>
    )
}
