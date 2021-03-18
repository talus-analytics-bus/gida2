// 3rd party libs
import React, { useState, useEffect } from "react";
import { renderToString } from "react-dom/server";

// styles and assets
import styles from "./dot.module.scss";

// utility
import { formatDate } from "../../../../misc/Util";

// common
import { Popup } from "../../../../common";

const Dot = ({ left, date, desc = "" }) => {
  // CONSTANTS //
  // formatted date
  const dateStr = formatDate(new Date(date));
  const dataHtml = renderToString(
    <Popup
      {...{
        body: [{ field: "Date", value: dateStr }],
        header: [{ title: desc, label: "calendar" }],
        style: { gridTemplateColumns: "40px auto" },
        popupStyle: { minWidth: "unset" },
      }}
    />
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
