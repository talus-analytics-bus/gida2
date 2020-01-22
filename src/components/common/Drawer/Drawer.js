import React from "react";
import classNames from "classnames";
import styles from "./drawer.module.scss";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Drawer
 */
const Drawer = ({ label, contentSections, ...props }) => {
  const [open, setOpen] = React.useState(props.openDefault || true);
  return (
    <div className={styles.drawer}>
      <div onClick={() => setOpen(!open)} className={styles.header}>
        <div className={styles.label}>{label}</div>
        <div className={styles.toggle}>
          <span
            className={classNames("glyphicon glyphicon-chevron-up", {
              [styles.flip]: !open
            })}
          />
        </div>
      </div>
      <div
        style={{ display: open ? "flex" : "none" }}
        className={styles.content}
      >
        {contentSections.map(s => (
          <div className={styles.section}>{s}</div>
        ))}
      </div>
    </div>
  );
};

export default Drawer;
