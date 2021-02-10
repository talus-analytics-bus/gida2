import React, { FunctionComponent } from "react";
import LegendOrdinal from "./LegendOrdinal/LegendOrdinal";
import styles from "./legendcontent.module.scss";

type LegendContentProps = {
  title: string;
};

export const LegendContent: FunctionComponent<LegendContentProps> = ({
  title,
}) => (
  <div className={styles.legendContent}>
    <div className={styles.title}>{title}</div>
  </div>
);

export default LegendContent;
