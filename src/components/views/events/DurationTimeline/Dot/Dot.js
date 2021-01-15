// 3rd party libs
import React, { useState, useEffect } from "react";
import { renderToString } from "react-dom/server";

// styles and assets
import styles from "./dot.module.scss";

// utility
import { formatDate } from "../../../../misc/Util";

const Dot = ({ left, date, desc = "" }) => {
  const dataHtml = renderToString(
    <div className={styles.dotTip}>
      <p>
        <strong>{desc}</strong>
      </p>
      <p>{formatDate(new Date(date))}</p>
    </div>
  );
  return (
    <div
      data-html
      data-tip={dataHtml}
      data-for={"dotTip"}
      style={{ left }}
      className={styles.dot}
    />
  );
};
export default Dot;
