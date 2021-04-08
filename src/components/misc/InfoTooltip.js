import React from "react"
import { renderToString } from "react-dom/server"
import imgSrc from "../../assets/images/info.svg"
import imgSrcLight from "../../assets/images/info-light.svg"
import styles from "./infotooltip.module.scss"

/**
 * Generic info tooltip
 * @method InfoTooltip
 */
const InfoTooltip = ({ text, light = false }) => {
  const dataHtml = renderToString(text)
  return (
    <div
      className={styles.infoTooltip}
      data-for={"infoTooltip"}
      data-html={true}
      data-tip={dataHtml}
    >
      <img src={light ? imgSrcLight : imgSrc} alt={"Info tooltip icon"} />
    </div>
  )
}

export default InfoTooltip
