import React, { FunctionComponent } from "react";
import LegendOrdinal, {
  LegendOrdinalEntries,
} from "./LegendOrdinal/LegendOrdinal";
import LegendChoropleth, {
  LegendChoroplethEntries,
} from "./LegendChoropleth/LegendChoropleth";
import styles from "./legendcontent.module.scss";

export enum LegendType {
  Ordinal = "ORDINAL",
  Choropleth = "CHOROPLETH",
}

type LegendContentProps = {
  title: { title: string };
  type: { type: LegendType };
  scale: Scale;
};

type Scale = {
  range: Function;
  values: string[];
};

const getLegendBody = (legendType: string, scale: Scale) => {
  if (legendType === LegendType.Ordinal) {
    const center: LegendOrdinalEntries = {
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
    const center: LegendChoroplethEntries = {
      colors: colorsTmp.slice(1, colorsTmp.length),
      labels: scale.values,
    };
    return (
      <LegendChoropleth
        {...{
          left: null,
          center,
          right: null,
        }}
      />
    );
  }
};

export const LegendContent: FunctionComponent<LegendContentProps> = ({
  title,
  type,
  scale,
}) => {
  // JSX //
  return (
    <div className={styles.legendContent}>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{getLegendBody(type.toString(), scale)}</div>
    </div>
  );
};

export default LegendContent;
