import React, { useState, useContext } from "react"
import { Redirect } from "react-router-dom"

// local components
import { EntryCard } from "../EntryCard/EntryCard"
import Selectpicker from "../../../chart/Selectpicker/Selectpicker"

// contexts
import OutbreakContext from "../../../context/OutbreakContext"

// assets and styles
import styles from "./pheicentrycard.module.scss"
import virionSvg from "./images/virion.svg"

/**
 * Home page entry point for accessing PHEIC pages.
 */
const PheicEntryCard = () => {
  // CONTEXT ACCESSORS
  const outbreaks = useContext(OutbreakContext)

  return (
    <EntryCard
      {...{
        graphic: <img src={virionSvg} alt={"A virion (virus particle)"} />,
        title: "Funding by PHEIC",
        className: styles.pheicEntryCard,
        description: (
          <>
            View response funding for the six{" "}
            <a
              href={"https://www.who.int/ihr/procedures/pheic/en/"}
              target={"_blank"}
            >
              public health emergencies of international concern (PHEICs)
            </a>
            .
          </>
        ),
        actions: [<PheicSelectpicker {...{ outbreaks }} />],
      }}
    />
  )
}

export default PheicEntryCard

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
            wide: true,
          }}
        />
      </div>
    )
}
