import React, { FC, ReactElement } from "react"
import styles from "./Disclaimer.module.scss"
import classNames from "classnames"
import CSS from "csstype"
interface DisclaimerProps {
  eventSlug: string
  /**
   * True if text should be unformatted, false if it should be red and large.
   */
  isUnformatted?: boolean
  /**
   * If true, show the disclaimer no matter what, if false, hide no matter what
   */
  show?: boolean

  style?: CSS.Properties
}
export const Disclaimer: FC<DisclaimerProps> = ({
  eventSlug,
  isUnformatted = false,
  show,
  style = {},
}): ReactElement | null => {
  if (
    (show !== undefined && show) ||
    eventSlug === "2009-2010-h1n1-swine-flu"
  ) {
    return (
      <div
        className={classNames(styles.disclaimer, {
          [styles.unformatted]: isUnformatted,
        })}
        {...{
          style,
        }}
      >
        <p>
          {!isUnformatted && <strong>Note: </strong>}Our current data are known
          to be incomplete for the 2009-2010 H1N1 Swine flu PHEIC. If you have
          any data to share, please contact us at{" "}
          <a target={"_blank"} href={"mailto:outbreaks@georgetown.edu"}>
            outbreaks@georgetown.edu
          </a>
          .
        </p>
        {isUnformatted && (
          <p>
            {/* <Link to={"/events/2009-2010-h1n1-swine-flu"}>
            <b>Click here</b>
          </Link>{" "} */}
            Click "Go to H1N1 PHEIC page" below to browse all data currently
            available for the 2009-2010 H1N1 Swine flu PHEIC.
          </p>
        )}
      </div>
    )
  } else return null
}

export default Disclaimer
