import React from "react";
import Popup from "reactjs-popup";
import axios from "axios";
import { Link } from "react-router-dom";

// Utilities (date formatting, etc.)
import Util from "../../../components/misc/Util.js";
import * as d3 from "d3/dist/d3.min";

import classNames from "classnames";
import styles from "./details.module.scss";

// FC for Details.
const Details = ({ ...props }) => {
  return <div>Details page</div>;
};

export const renderDetails = id => {
  return <div>Details for {id}</div>;
};

export default Details;
