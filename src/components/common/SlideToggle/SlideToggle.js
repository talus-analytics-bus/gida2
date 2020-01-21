import React from "react";
import classNames from "classnames";
import styles from "./slidetoggle.module.scss";

const SlideToggle = ({ label, show, setShow, ...props }) => {
  return (
    <div className={classNames(styles.toggle, { [styles.flip]: show })}>
      <button onClick={() => setShow(!show)}>
        <span className={"caret"} />
        {show ? "hide" : "show"} {label}
        <span className={"caret"} />
      </button>
    </div>
  );
};
export default SlideToggle;
