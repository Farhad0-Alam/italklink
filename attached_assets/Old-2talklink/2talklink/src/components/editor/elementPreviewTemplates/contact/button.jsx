import { hexToRGBA } from "../../../../../lib/hexToRGBA";
import styles from "./Link.module.css";
const Button = (props) => {
  const { disabled, label, primaryColor, secondaryColor, tertiaryColor } =
    props;

  if (props.htmlId == "1") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{ color: props.primaryColor }}
            >
              {label}
            </button>
            <span
              className={styles.link_bg}
              style={{
                backgroundImage: props.defaultGradient,
              }}
            ></span>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "2") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{ color: props.primaryColor }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "3") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                boxShadow: "0px 4px 12px" + props.primaryColor,
                backgroundColor: props.primaryColor,
                color: props.secondaryColor,
              }}
            >
              {label}
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "4") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <div
              className={styles.link_bg}
              style={{ color: props.primaryColor }}
            >
              <button
                type="submit"
                disabled={disabled}
                style={{
                  backgroundColor: props.primaryColor,
                  color: props.secondaryColor,
                }}
              >
                {label}
              </button>
            </div>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "5") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                backgroundColor: props.secondaryColor,
                color: props.primaryColor,
              }}
            >
              {label}
            </button>
            <span
              className={styles.link_bg}
              style={{ color: props.primaryColor }}
            ></span>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "6") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{ color: props.secondaryColor }}
            >
              {label}
            </button>
            <span
              className={styles.link_bg}
              style={{ color: props.primaryColor }}
            ></span>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "7") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                backgroundImage: props.defaultGradient,
                color: props.secondaryColor,
              }}
            >
              {label}
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "8") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button type="submit" disabled={disabled}>
              <span
                className={styles.text__link}
                style={{
                  backgroundImage: props.defaultGradient,
                }}
              >
                {label}
              </span>
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "9") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{ color: props.secondaryColor }}
            >
              {label}
            </button>
            <span
              className={styles.link_bg}
              style={{
                border: "4px solid" + props.primaryColor,
              }}
            ></span>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "10") {
    return (
      <>
        <div
          className={
            "theme-tracker-10 " +
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <div className={styles.link_inner}>
              <button
                type="submit"
                disabled={disabled}
                style={{
                  backgroundColor: props.primaryColor,
                  boxShadow: "-4px 9px 25px -6px" + props.primaryColor,
                }}
              >
                {label}
              </button>
            </div>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "11") {
    return (
      <>
        <div
          style={{
            backgroundColor: props.primaryColor,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{ color: props.secondaryColor }}
            >
              {label}
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "12") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{ color: props.secondaryColor }}
            >
              {label}
              <span
                className={styles.bg_12}
                style={{
                  backgroundColor: props.primaryColor,
                }}
              ></span>
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "13") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              color: props.secondaryColor,
              border: "2px solid" + props.primaryColor,
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "14") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{ color: props.primaryColor }}
          >
            {label}
          </button>
          <span
            className={styles.link_bg}
            style={{
              backgroundColor: props.primaryColor,
              color: props.primaryColor,
            }}
          ></span>
        </div>
      </>
    );
  } else if (props.htmlId == "15") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                backgroundImage: props.defaultGradient,
                color: props.secondaryColor,
              }}
            >
              {label}

              <span
                className={styles.link_bg}
                style={{
                  backgroundImage: props.defaultGradient,
                }}
              ></span>
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "16") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                backgroundColor: props.secondaryColor,
                color: props.primaryColor,
              }}
            >
              {label}
              <span
                className={styles.link_bg}
                style={{
                  borderBottom: "5px solid" + props.primaryColor,
                }}
              ></span>
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "17") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                backgroundColor: props.secondaryColor,
                color: props.primaryColor,
                border: "2px solid" + props.primaryColor,
              }}
            >
              {label}
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "18") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                backgroundColor: props.secondaryColor,
                color: props.primaryColor,
              }}
            >
              <span
                style={{
                  backgroundImage: props.defaultGradient,
                }}
              >
                {label}
              </span>
            </button>
            <span
              className={styles.link_bg}
              style={{
                backgroundImage: props.defaultGradient,
              }}
            ></span>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "19") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{
                backgroundColor: props.secondaryColor,
              }}
            >
              {label}

              <span
                className={styles.link_bg}
                style={{
                  border: "2px solid" + props.primaryColor,
                }}
              ></span>
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "20") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            fontFamily: props.textFont,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <>
            <button
              type="submit"
              disabled={disabled}
              style={{ color: props.secondaryColor }}
            >
              <>{label}</>
              <span className={styles.link_bg}></span>
            </button>
          </>
        </div>
      </>
    );
  } else if (props.htmlId == "21") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              color: tertiaryColor,
              backgroundColor: primaryColor,
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "22") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              border: `.2rem solid ${primaryColor}`,
              color: tertiaryColor,
              backgroundColor: hexToRGBA(primaryColor),
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "23") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              color: tertiaryColor,
              backgroundColor: primaryColor,
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "24") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              color: tertiaryColor,
              backgroundColor: primaryColor,
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "25") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              color: tertiaryColor,
              backgroundColor: primaryColor,
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "26") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              color: tertiaryColor,
              backgroundColor: primaryColor,
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else if (props.htmlId == "27") {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{
              color: secondaryColor,
              backgroundColor: primaryColor,
            }}
          >
            {label}
          </button>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div
          className={
            styles.link_wrapper +
            " " +
            styles["themes_" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_link : "") +
            "  " +
            (props.item?.animation
              ? `animate__animated animate__${props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
              }  animate__${props.item?.animation.name}`
              : "")
          }
          style={{
            backgroundImage: props.defaultGradient,
            animationDuration: props.item?.animation
              ? `${props.item?.animation?.animationDuration}ms`
              : "",
            animationDelay: props.item?.animation
              ? `${props.item?.animation?.animationDelay}ms`
              : "",
          }}
        >
          <button
            type="submit"
            disabled={disabled}
            style={{ color: props.primaryColor }}
          >
            <div>{label}</div>
            <span
              className={styles.link_bg}
              style={{
                backgroundImage: props.defaultGradient,
              }}
            ></span>
          </button>
        </div>
      </>
    );
  }
};

export default Button;
