// 3rd party libs
import React, { useState, useEffect } from "react";

// styles and assets
import styles from "./pathogenbox.module.scss";
import transmissionSvg from "./svg/transmission.svg";
import virionSvg from "./svg/virion.svg";
import stethoscopeSvg from "./svg/stethoscope.svg";
import syringeSvg from "./svg/syringe.svg";

// utility
import { NONE_VALS, getInitCap } from "../../../misc/Util";

const PathogenBox = ({
  pathogen_name,
  transmission_type,
  route_of_infection,
  signs_and_symptoms,
  mcms_during_event,
}) => {
  // CONSTANTS //
  const arrJoin = (a = []) => getInitCap(a.join(", ").toLowerCase());
  const factDefs = [
    {
      icon: transmissionSvg,
      title: "Transmission",
      data: transmission_type,
      fmt: arrJoin,
    },
    {
      icon: virionSvg,
      title: "Route of infection",
      data: route_of_infection,
      fmt: arrJoin,
    },
    {
      icon: stethoscopeSvg,
      title: "Signs & symptoms",
      data: signs_and_symptoms,
      fmt: v => v,
    },
    {
      icon: syringeSvg,
      title: "Medical countermeasures available during event",
      data: mcms_during_event,
      fmt: v => v,
    },
  ];
  // FUNCTIONS //
  const getFacts = () => {
    return factDefs
      .filter(d => !NONE_VALS.includes(d.data))
      .map(d => (
        <div className={styles.fact}>
          <img src={d.icon} className={styles.icon} />
          <div className={styles.titleAndValue}>
            <div className={styles.title}>{d.title}</div>
            <div className={styles.value}>{d.fmt(d.data)}</div>
          </div>
        </div>
      ));
  };

  // FUNCTION CALLS //
  const facts = getFacts();

  return (
    <div className={styles.pathogenBox}>
      <div className={styles.title}>Pathogen</div>
      <div className={styles.name}>{pathogen_name}</div>
      <div className={styles.facts}>{facts}</div>
    </div>
  );
};
export default PathogenBox;
