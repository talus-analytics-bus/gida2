// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./minimap.module.scss";
import placeholderSvg from "./placeholder.svg";

const MiniMap = ({}) => {
  return (
    <div className={styles.miniMap}>
      <img src={placeholderSvg} />
    </div>
  );
};
export default MiniMap;
