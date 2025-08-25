import React, { useState } from "react";
import styles from "./Accordion.module.css"; // Import the CSS module

const Accordion = (props) => {
  const {
    item,
    title,
    description,
    tempId,
    templateStyle,
    pageId,
    isAdmin,
    linkSlug,
    htmlId,
    textFont,
    primaryColor,
    secondaryColor,
    defaultGradient,
    isEditorPreview,
    headingFont,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={
        styles.accordionItem +
        " " +
        styles["theme_" + htmlId] +
        " " +
        (props.item?.animation
          ? `animate__animated animate__${
              props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
            }  animate__${props.item?.animation.name}`
          : "")
      }
    >
      <div
        className={styles.accordionTitle}
        onClick={toggleAccordion}
        style={{
          "--heading-font": headingFont,
          "--text-font": textFont,
        }}
      >
        <h3
          style={{
            color: templateStyle?.tertiary_color || "#fff",
            fontFamily: "Poppins, sans-serif",
            fontSize: "15px",
            fontWeight: "500",
            lineHeight: "21px",
          }}
        >
          {title}
        </h3>
        <span className={isOpen ? styles.rotate : ""}>
          {isOpen ? (
            <svg
              fill={templateStyle?.tertiary_color || "#fff"}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              height={15}
              width={15}
            >
              <path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z" />
            </svg>
          ) : (
            <svg
              fill={templateStyle?.tertiary_color || "#fff"}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              height={15}
              width={15}
            >
              <path d="M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 361.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 210.7 361.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z" />
            </svg>
          )}
        </span>
      </div>
      <div
        className={`${styles.accordionContent} ${isOpen ? styles.open : ""}`}
      >
        <div
          className="ql-snow ql-editor"
          dangerouslySetInnerHTML={{ __html: description }}
        ></div>
      </div>
    </div>
  );
};

export default Accordion;
