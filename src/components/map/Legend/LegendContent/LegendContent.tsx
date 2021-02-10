import React, { FunctionComponent } from "react";
import LegendOrdinal from "./LegendOrdinal/LegendOrdinal";

type LegendContentProps = {
  title: string;
  paragraph: string;
};

export const LegendContent: FunctionComponent<LegendContentProps> = ({
  title,
  paragraph,
}) => (
  <aside>
    <h2>{title}</h2>
    <p>{paragraph}</p>
  </aside>
);

export default LegendContent;
