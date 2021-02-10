import React, { FunctionComponent } from "react";

type LegendOrdinalProps = {
  title: string;
  paragraph: string;
};

export const LegendOrdinal: FunctionComponent<LegendOrdinalProps> = ({
  title,
  paragraph,
}) => (
  <aside>
    <h2>{title}</h2>
    <p>{paragraph}</p>
  </aside>
);

export default LegendOrdinal;
