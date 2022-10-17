// 3rd party libs
import React, { useState, useEffect } from "react"

// styles and assets
import styles from "./events.module.scss"
import classNames from "classnames"

// common and local components
import EventTable from "../details/content/EventTable"
import PheicList from "./PheicList"
import { Loading } from "../../common/"

export const Events = ({ ...props }) => {
  // STATE //
  const [loaded, setLoaded] = useState(false)

  // JSX //
  return (
    <div className={classNames("pageContainer", styles.events)}>
      <article>
        <h2 className={styles.title}>What are PHEICs?</h2>
        <p>
          A PHEIC, or public health emergency of international concern, is a
          declaration used by the World Health Organization (WHO) when a public
          health threat unexpectedly emerges that has the potential to spread
          beyond the affected country’s national borders. The
          <a
            href={"https://www.who.int/publications/i/item/9789241580496"}
            target={"_blank"}
          >
            {" "}
            International Health Regulations (2005)
          </a>{" "}
          confer certain legal obligations on states to respond to the PHEIC.
        </p>
        <p>
          Seven PHEICs have been declared to date, listed below from most recent
          to least. Click a PHEIC below to view the funding provided and
          received for the response to the PHEIC, as well as details including a
          description of the event and the pathogen.
        </p>
        <PheicList />
      </article>
      <h2 className={styles.title}>PHEIC funding projects</h2>
      <Loading {...{ loaded, align: "center", slideUp: true, top: "-20px" }}>
        <div className={styles.instructions}>
          Click PHEIC in table to view details. Each row is a project supporting
          the response to one or more PHEICs.
        </div>
        <EventTable {...{ setLoaded, sortByProp: "amount-disbursed_funds" }} />
      </Loading>
    </div>
  )
}
export default Events
