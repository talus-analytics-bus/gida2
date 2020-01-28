import React from "react";
import styles from "./ghsabutton.module.scss";
import Button from "../Button/Button.js";
import image from "../../../assets/images/gida-logo.png";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method GhsaButton
 */
const GhsaButton = ({ ...props }) => {
  return (
    <Button
      {...{
        className: styles.ghsaButton,
        isDark: props.isDark,
        label: props.active ? (
          <span className={styles.active}>GHSA</span>
        ) : (
          <span>GHSA</span>
        ),
        image,
        type: "secondary",
        linkTo: "/details/ghsa"
      }}
    />
  );
};

export default GhsaButton;
