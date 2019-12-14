import React from "react";
import classNames from "classnames";
import styles from "./tab.module.scss";

// FC for Tab.
const Tab = ({ content, selected, ...props }) => {
  return (
    <div className={classNames(styles.tab, { [styles.selected]: selected })}>
      {content}
    </div>
  );
};

export default Tab;
