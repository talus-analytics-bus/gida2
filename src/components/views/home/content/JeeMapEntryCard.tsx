import React, { useState, useContext } from "react"
import { Redirect } from "react-router-dom"

// local components
import { EntryCard } from "../EntryCard/EntryCard"
import Selectpicker from "../../../chart/Selectpicker/Selectpicker"
import { SlideUp } from "../../../common"

// assets and styles
import styles from "./pheicentrycard.module.scss"
import pngSrc from "./images/jee-map.png"
import { Button } from "../../../common"

/**
 * Home page entry point for accessing JEE score maps.
 */
const JeeMapEntryCard = () => {
  return (
    <SlideUp delayFactor={10}>
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
          title: "JEE scores",
          className: undefined,
          description: (
            <>
              View{" "}
              <a
                href={
                  "https://www.who.int/ihr/procedures/joint-external-evaluations/en/"
                }
                target={"_blank"}
              >
                Joint External Evaluation (JEE)
              </a>{" "}
              scores for each country that has completed the assessment.
            </>
          ),
          actions: [
            <Button
              {...{
                type: "primary",
                label: "View JEE scores",
                linkTo: "/map?supportType=jee",
                url: undefined,
                disabled: false,
                iconName: null,
              }}
            />,
          ],
        }}
      />
    </SlideUp>
  )
}

export default JeeMapEntryCard

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
