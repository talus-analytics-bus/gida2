import React, { FunctionComponent } from "react"
import LegendOrdinal from "./LegendOrdinal/LegendOrdinal"
import LegendChoropleth from "./LegendChoropleth/LegendChoropleth"
import LegendContinuous from "./LegendContinuous/LegendContinuous"
import { getLabel } from "./ValueLabel/ValueLabel"
import styles from "./legendcontent.module.scss"

export type LegendEntries = {
  colors: string[]
  labels: string[]
}

export type LegendSides = {
  center: LegendEntries | null
  left: LegendEntries | null
  right: LegendEntries | null
}

export enum LegendType {
  Ordinal = "ORDINAL",
  Choropleth = "CHOROPLETH",
  Continuous = "CONTINUOUS",
}

// TODO simplify, e.g., "title: string"
type LegendContentProps = {
  title: { title: string }
  type: { type: LegendType }
  scale: Scale
  sides: LegendSides | null
}

type LegendBodyProps = {
  legendType: string
  scale: Scale
  sides: LegendSides | null
}

// TODO use more descriptive property names
// TODO separate this component from concept of GHS Tracking,
// e.g., `supportType`
type Scale = {
  range: Function
  values: string[]
  supportType: string
}

export const LegendContent = ({
  title,
  type,
  scale,
  sides,
}: LegendContentProps) => {
  // JSX //
  return (
    <div className={styles.legendContent}>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>
        <LegendBody {...{ legendType: type.toString(), scale, sides }} />
      </div>
    </div>
  )
}

// Body of legend
const LegendBody = ({
  legendType,
  scale,
  sides,
}: LegendBodyProps): JSX.Element | null => {
  if (legendType === LegendType.Ordinal) {
    const center: LegendEntries = {
      colors: scale.range(),
      labels: scale.values,
    }
    return (
      <LegendOrdinal
        {...{
          left: null,
          center,
          right: null,
        }}
      />
    )
  } else if (legendType === LegendType.Choropleth) {
    const colorsTmp: string[] = scale.range()
    const noNumericValues: boolean = scale.values[0] === undefined
    const center: LegendEntries | null = noNumericValues
      ? null
      : {
          colors: colorsTmp.slice(1, colorsTmp.length),
          labels: scale.values,
        }
    return (
      <LegendChoropleth
        {...{
          left: {
            colors: ["#b3b3b3", colorsTmp[0]],
            labels: [
              "None",
              noNumericValues
                ? "Unspecified"
                : `Under ${getLabel(scale.values[0])} or unspecified`,
            ],
          },
          center,
          right: sides !== null ? sides.right : null,
        }}
      />
    )
  } else if (legendType === LegendType.Continuous) {
    const center: LegendEntries = {
      colors: scale.range(),
      labels:
        scale.supportType !== "needs_met"
          ? scale.values
          : ["Needs met", "Needs unmet"],
    }
    return (
      <LegendContinuous
        {...{
          left: {
            colors: ["#b3b3b3"],
            labels: ["None"],
          },
          center,
          right: sides !== null ? sides.right : null,
        }}
      />
    )
  } else {
    throw "Unrecognized legend type: " + legendType
  }
}

export default LegendContent
