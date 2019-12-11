import React from "react";
import Util from "../../misc/Util.js";
import styles from "./stackbar.module.scss";
import * as d3 from "d3/dist/d3.min";

// FC
const StackBar = ({ data, flowType, ...props }) => {
  console.log("data - StackBar");
  console.log(data);
  return <div className={styles.stackbar}>StackBar placeholder</div>;
};

export default StackBar;
