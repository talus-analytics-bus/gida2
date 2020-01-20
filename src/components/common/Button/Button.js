import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./button.module.scss";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Button
 */
const Button = ({ label, ...props }) => {
  const classes = props.className ? [props.className] : [];
  const button = (
    <button
      onClick={props.callback}
      className={classNames(...classes, styles.button, {
        [styles.secondary]: props.type === "secondary"
      })}
    >
      {props.image && <img src={props.image} />}
      {label}
    </button>
  );
  if (props.linkTo)
    return (
      <Link className={styles.link} to={props.linkTo}>
        {button}
      </Link>
    );
  else return button;
};
export default Button;
