import React from "react";
import { useState } from "react";
import styles from "./Accordion.module.css";
import { Edit2 } from "lucide-react";
import { makeStyles } from "../card-preview";

const Accordion = ({
  styles: acStyles,
  content,
  Icon,
  element,
  onOpenModal,
}) => {
  const [openIndex, setOpenIndex] = useState(false);

  const toggleItem = () => {
    setOpenIndex((prev) => !prev);
  };

  const dynamicStyles = makeStyles(element);

  const secondaryBg = element?.secondaryBg;
  const secondaryColor = element?.secondaryColor;
  const secondaryDynamicStyles = {
    background: secondaryBg || "unset",
    color: secondaryColor || "unset",
  };
  const { background, color, fontSize, padding, ...otherColor } = dynamicStyles;
  return (
    <div
      className={`${styles.accordion} ${acStyles.editableSection}`}
      style={{ userSelect: "none" }}
    >
      <div className={styles.element} style={{ ...otherColor }}>
        <div
          style={{ ...dynamicStyles }}
          className={styles.title}
          onClick={() => toggleItem()}
        >
          {element.title}
          <span
            style={{ userSelect: "none" }}
            className={`${styles.icon} ${openIndex ? styles.iconOpen : ""}`}
          >
            ▼
          </span>
          {!openIndex && (
            <Edit2
              className={acStyles.editIcon}
              size={18}
              style={{
                background: "#fff",
                padding: "1px",
                borderRadius: "50%",
                right: "11%",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(element);
              }}
            />
          )}
        </div>
        {openIndex && (
          <div
            style={{ ...secondaryDynamicStyles, ...otherColor, padding }}
            className={styles.content}
          >
            {element.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accordion;
