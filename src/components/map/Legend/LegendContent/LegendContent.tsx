import React, { FunctionComponent } from "react";
import LegendOrdinal from "./LegendOrdinal/LegendOrdinal";
import LegendChoropleth from "./LegendChoropleth/LegendChoropleth";
import { getLabel } from "./ValueLabel/ValueLabel";
import styles from "./legendcontent.module.scss";

export type LegendEntries = {
  colors: string[];
  labels: string[];
};

export type LegendSides = {
  center: LegendEntries | null;
  left: LegendEntries | null;
  right: LegendEntries | null;
};

export enum LegendType {
  Ordinal = "ORDINAL",
  Choropleth = "CHOROPLETH",
}

type LegendContentProps = {
  title: { title: string };
  type: { type: LegendType };
  scale: Scale;
  sides: LegendSides | null;
};

type Scale = {
  range: Function;
  values: string[];
};

const getLegendBody = (
  legendType: string,
  scale: Scale,
  sides: LegendSides | null
) => {
  if (legendType === LegendType.Ordinal) {
    const center: LegendEntries = {
      colors: scale.range(),
      labels: scale.values,
    };
    return (
      <LegendOrdinal
        {...{
          left: null,
          center,
          right: null,
        }}
      />
    );
  } else if (legendType === LegendType.Choropleth) {
    const colorsTmp: string[] = scale.range();
    const noNumericValues: boolean = scale.values[0] === undefined;
    const center: LegendEntries | null = noNumericValues
      ? null
      : {
          colors: colorsTmp.slice(1, colorsTmp.length),
          labels: scale.values,
        };
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
    );
  }
};

export const LegendContent: FunctionComponent<LegendContentProps> = ({
  title,
  type,
  scale,
  sides,
}) => {
  // JSX //
  return (
    <div className={styles.legendContent}>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>
        {getLegendBody(type.toString(), scale, sides)}
      </div>
    </div>
  );
};

export default LegendContent;
