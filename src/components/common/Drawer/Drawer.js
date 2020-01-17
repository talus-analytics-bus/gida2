import React from "react";
import styles from "./drawer.module.scss";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method Drawer
 */
const Drawer = ({ label, content, ...props }) => {
  const [open, setOpen] = React.useState(props.openDefault || true);
  return (
    <div className={styles.drawer}>
      <div className={styles.label}>{label}</div>
      <div className={styles.toggle} />
      <div className={styles.content}>{content}</div>
    </div>
  );
};

export default Drawer;
