import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./button.module.scss";
import close from "../../../assets/images/close.png";
import plusWhite from "../../../assets/images/plus-white.svg";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Button
 */
const Button = ({ label, url, disabled = false, ...props }) => {
  const classes = props.className ? [props.className] : [];
  const button = (
    <button
      style={props.linkTo === undefined ? props.style : undefined}
      onClick={props.onClick || props.callback}
      className={classNames(...classes, styles.button, {
        [styles.secondary]: props.type === "secondary",
        [styles.primary]: props.type === "primary",
        [styles.close]: props.type === "close",
        [styles.closeBadge]: props.type === "close-badge",
        [styles.dark]: props.isDark,
        [styles.disabled]: disabled,
      })}
    >
      {props.type === "close" && <img src={close} />}
      {props.type === "close-badge" && <img src={plusWhite} />}
      {props.image && <img src={props.image} />}
      {label}
    </button>
  );
  if (props.linkTo) {
    return (
      <Link style={props.style} className={styles.link} to={props.linkTo}>
        {button}
      </Link>
    );
  } else if (url) {
    return (
      <a style={props.style} className={styles.link} href={url} target="_blank">
        {button}
      </a>
    );
  } else return button;
};
export default Button;
