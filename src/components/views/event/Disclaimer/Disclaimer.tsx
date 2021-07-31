import React, { FC, ReactElement } from "react"
import styles from "./Disclaimer.module.scss"
interface DisclaimerProps {
  eventSlug: string
}
export const Disclaimer: FC<DisclaimerProps> = ({
  eventSlug,
}): ReactElement | null => {
  if (eventSlug === "2009-2010-h1n1-swine-flu") {
    return (
      <div className={styles.disclaimer}>
        <strong>Note:</strong> Our current data are known to be incomplete for
        the 2009-2010 H1N1 Swine flu PHEIC. If you have any data to share,
        please contact us at{" "}
        <a target={"_blank"} href={"mailto:outbreaks@georgetown.edu"}>
          outbreaks@georgetown.edu
        </a>
        .
      </div>
    )
  } else return null
}

export default Disclaimer
