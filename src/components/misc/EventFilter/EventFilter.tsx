// 3rd party components
import React, {
  SetStateAction,
  Dispatch,
  FC,
  ReactElement,
  useState,
} from "react"
import Modal from "reactjs-popup"
import styles from "./EventFilter.module.scss"
import modalStyles from "../../../Modal.module.scss"
import classNames from "classnames"

// local components
import { Button, FilterDropdown } from "../../common"
import { Disclaimer } from "../../views/event"
import { Link } from "react-router-dom"

// props
interface EventFilterProps {
  outbreakOptions: { value: any; label: string }[]
  events: Object[]
  setEvents: Dispatch<SetStateAction<Object[]>>
  isDark: boolean
  openDirection: "down" | "up"
}

// FC
export const EventFilter: FC<EventFilterProps> = ({
  outbreakOptions,
  events,
  setEvents,
  isDark = false,
  openDirection = "down",
}): ReactElement => {
  const [showingH1n1Modal, setShowingH1n1Modal] = useState(false)
  // const eventsExceptH1n1: Object[] = events.filter((e: any) => e !== 673)
  return (
    <>
      <FilterDropdown
        {...{
          label: "Select PHEICs",
          options: outbreakOptions,
          placeholder: "Select PHEIC",
          onChange: (v: any) => {
            const vNoH1n1: Object[] = v.filter((vv: any) => vv.value !== 673)
            const h1n1Selected: boolean = v.some((vv: any) => vv.value === 673)
            setShowingH1n1Modal(h1n1Selected)
            setEvents(vNoH1n1.map((d: any) => d.value))
          },
          curValues: events,
          className: [styles.italic],
          isDark,
          openDirection,
        }}
      />
      {
        // @ts-ignore
        <Modal
          position="top center"
          on="click"
          closeOnDocumentClick
          defaultOpen={false}
          open={showingH1n1Modal}
          onClose={() => setShowingH1n1Modal(false)}
          modal
        >
          {close => (
            <div
              className={classNames(modalStyles.modal, {
                [modalStyles.dark]: isDark,
              })}
            >
              <div className={modalStyles.header}>
                2009-2010 H1N1 Swine flu PHEIC data
              </div>
              <div className={modalStyles.content}>
                <div className={modalStyles.text}>
                  <Disclaimer
                    isUnformatted
                    eventSlug={"2009-2010-h1n1-swine-flu"}
                  />
                </div>
                <div className={modalStyles.actions}>
                  <Link to={"/events/2009-2010-h1n1-swine-flu"}>
                    <Button
                      padded
                      label={"Go to H1N1 PHEIC page"}
                      type={"secondary"}
                      onClick={close}
                      {...{ isDark }}
                    />
                  </Link>
                  <Button
                    label={"Dismiss"}
                    type={"primary"}
                    onClick={close}
                    {...{ isDark }}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      }
    </>
  )
}
