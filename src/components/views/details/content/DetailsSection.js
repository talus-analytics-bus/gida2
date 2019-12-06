import React from "react";
import styles from "./detailssection.module.scss";

// FC for Details.
const DetailsSection = ({ header, content, ...props }) => {
  return (
    <div className={styles.detailsSection}>
      {header}
      {content}
    </div>
  );
};

export default DetailsSection;
