import React from "react";
import styles from "../_styles/Button.module.css";

export default function Button({ children, ...props }) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  );
}
