import React, { FunctionComponent } from "react";
import LegendOrdinal, {
  LegendOrdinalEntries,
} from "./LegendOrdinal/LegendOrdinal";
import styles from "./legendcontent.module.scss";

enum LegendType {
  Ordinal = "ORDINAL",
}

type LegendContentProps = {
  title: { title: string };
  type: { type: LegendType };
  scale: Scale;
};

type Scale = {
  range: Function;
  domain: Function;
};

const getLegendBody = (legendType: string, scale: Scale) => {
  if (legendType === LegendType.Ordinal) {
    const center: LegendOrdinalEntries = {
      colors: scale.range(),
      labels: scale.domain(),
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
      <div className={styles.body}>{getLegendBody("ORDINAL", scale)}</div>
    </div>
  );
};

export default LegendContent;
