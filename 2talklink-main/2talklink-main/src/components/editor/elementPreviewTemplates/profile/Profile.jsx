import { getNameInitials } from "../../../../helper/helper";
import styles from "./Profile.module.css";
import handleVCard from "../../../../../utils/handleVCard";
import {
  generateCoverV1,
  generateCoverV3,
  generateCoverV4,
} from "./_utils/generateCover";
import { useRouter } from "next/router";
import CommonProfile from "../common/commonProfile";
const Profile = (props) => {
  const { secondaryColor, primaryColor } = props || {};
  const { template } = props?.props || {};
  const { templateStyle } = template || {};
  const { default_gradient } = templateStyle || {};
  const { colors } = default_gradient || {};

  const gradientOne = colors?.length ? colors[0] : "";
  const gradientTwo = colors?.length ? colors[1] : "";
  const tertiary_color = templateStyle?.tertiary_color || "#fff";
  const gradientNumberTwo = gradientTwo?.color || "#fff";

  const { asPath, query } = useRouter();

  const p = props?.sections
    ?.filter((section) => section?.status)
    ?.filter((section) => section?.sectionData?.pageType === "page");

  const disableScroll = () => {
    window.addEventListener("wheel", preventDefaultScroll, { passive: false });
  };

  // Enable default scroll behavior on page
  const enableScroll = () => {
    window.removeEventListener("wheel", preventDefaultScroll, {
      passive: false,
    });
  };

  // Prevent default scroll behavior
  const preventDefaultScroll = (event) => {
    event.preventDefault();
  };

  // Handle horizontal scroll within the container
  const handleWheel = (event) => {
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
  };

  if (props.htmlId == "1") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
          >
            <div
              className={styles.profile_bg}
              style={{ backgroundImage: props.defaultGradient }}
            ></div>
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
          </div>
          <div
            className={styles.name}
            style={{
              color: props.headingColor,
              fontFamily: props.headingFont ? props.headingFont : "Nunito",
            }}
          >
            {props.name}
          </div>
          <div
            className={styles.tagline}
            style={{
              color: props.pragraphColor,
              fontFamily: props.textFont ? props.textFont : "Nunito",
            }}
          >
            {props.tagline}
          </div>

          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "2") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={styles.profile_bg}
            style={{ backgroundImage: props.defaultGradient }}
          ></div>
          <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
          >
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
          </div>
          <div className={styles.profile_details} style={{ flexDirection: "column" }}>
            <div
              className={styles.name}
              style={{
                color: props.headingColor,
                fontFamily: props.headingFont ? props.headingFont : "Nunito",
              }}
            >
              {props.name}
            </div>
            <div
              className={styles.tagline}
              style={{
                color: props.pragraphColor,
                fontFamily: props.textFont ? props.textFont : "Nunito",
              }}
            >
              {props.tagline}
            </div>

            {!props.isSocialBoxHide ? (
              <div className={styles.social_icon_list}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <a
                        key={icon.id}
                        target="_blank"
                        rel="noreferrer"
                        href={
                          icon.itype === "whatsapp"
                            ? "https://wa.me/" + icon.value
                            : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                              ? "mailto:" + icon.value
                              : icon.itype === "connect"
                                ? `sms:${icon.value || ""
                                }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                : icon.itype === "text"
                                  ? `sms:${icon.value || ""}`
                                  : icon.value
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                        ></span>
                      </a>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "3") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
          >
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
          </div>
          <div style={{ flexDirection: "column" }} className={styles.profile_details}>
            <div
              className={styles.name}
              style={{
                color: props.headingColor,
                fontFamily: props.headingFont ? props.headingFont : "Nunito",
              }}
            >
              {props.name}
            </div>
            <div
              className={styles.tagline}
              style={{
                color: props.pragraphColor,
                fontFamily: props.textFont ? props.textFont : "Nunito",
              }}
            >
              {props.tagline}
            </div>

            {!props.isSocialBoxHide ? (
              <div className={styles.social_icon_list}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <a
                        key={icon.id}
                        target="_blank"
                        rel="noreferrer"
                        href={
                          icon.itype === "whatsapp"
                            ? "https://wa.me/" + icon.value
                            : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                              ? "mailto:" + icon.value
                              : icon.itype === "connect"
                                ? `sms:${icon.value || ""
                                }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                : icon.itype === "text"
                                  ? `sms:${icon.value || ""}`
                                  : icon.value
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                        ></span>
                      </a>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "4") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={styles.profile_bg}
            style={{ backgroundImage: props.defaultGradient }}
          >
            <div className={styles.profile_fix}>
              <div
                className={
                  styles.avatar + " " + (props.imageURL ? styles.has_image : "")
                }
              >
                <div className={styles.avatar_initial}>
                  {getNameInitials(props.name)}
                </div>
                {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
              </div>
              <div
                className={styles.name}
                style={{
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>

          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "5") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
          >
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            <span
              className={styles.theme_border}
              style={{ boxShadow: "0px 0px 0px 2px" + props.primaryColor }}
            ></span>
          </div>
          <div
            className={styles.name}
            style={{
              color: props.headingColor,
              fontFamily: props.headingFont ? props.headingFont : "Nunito",
            }}
          >
            {props.name}
          </div>
          <div
            className={styles.tagline}
            style={{
              color: props.pragraphColor,
              fontFamily: props.textFont ? props.textFont : "Nunito",
            }}
          >
            {props.tagline}
          </div>

          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "6") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
          >
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            <span
              className={styles.theme_border}
              style={{ border: "10px solid" + props.primaryColor }}
            ></span>
          </div>
          <div
            className={styles.name}
            style={{
              color: props.headingColor,
              fontFamily: props.headingFont ? props.headingFont : "Nunito",
            }}
          >
            {props.name}
          </div>
          <div
            className={styles.tagline}
            style={{
              color: props.pragraphColor,
              fontFamily: props.textFont ? props.textFont : "Nunito",
            }}
          >
            {props.tagline}
          </div>

          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "7") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
          >
            {props.imageURL ? (
              <img src={props.imageURL} alt="" />
            ) : (
              <div
                className={styles.avatar_initial}
                style={{ backgroundImage: props.defaultGradient }}
              >
                {getNameInitials(props.name)}
              </div>
            )}

            <div className={styles.profile_headings}>
              <div
                className={styles.name}
                style={{
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>

          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "8") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={styles.profile_bg}
            style={{ backgroundColor: props.secondaryColor }}
          ></div>
          <div className={styles.box_main_flx}>
            <div className={styles.box_flx}>
              <div
                className={
                  styles.avatar + " " + (props.imageURL ? styles.has_image : "")
                }
              >
                <div className={styles.avatar_initial}>
                  {getNameInitials(props.name)}
                </div>
                {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
              </div>
              <div className={styles.box_left_content}>
                <div
                  className={styles.name}
                  style={{
                    color: props.headingColor,
                    fontFamily: props.headingFont
                      ? props.headingFont
                      : "Nunito",
                  }}
                >
                  {props.name}
                </div>
                <div
                  className={styles.tagline}
                  style={{
                    color: props.pragraphColor,
                    fontFamily: props.textFont ? props.textFont : "Nunito",
                  }}
                >
                  {props.tagline}
                </div>
              </div>
            </div>
            {!props.isSocialBoxHide ? (
              <div
                className={styles.social_icon_list}
                style={{ backgroundImage: props.defaultGradient }}
              >
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <a
                        key={icon.id}
                        target="_blank"
                        rel="noreferrer"
                        href={
                          icon.itype === "whatsapp"
                            ? "https://wa.me/" + icon.value
                            : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                              ? "mailto:" + icon.value
                              : icon.itype === "connect"
                                ? `sms:${icon.value || ""
                                }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                : icon.itype === "text"
                                  ? `sms:${icon.value || ""}`
                                  : icon.value
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                        ></span>
                      </a>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "9") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div className={styles.box_main_flx}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
              <span
                className={styles.theme_border}
                style={{ backgroundColor: props.primaryColor }}
              ></span>
            </div>
            <div className={styles.box_left_content}>
              <div
                className={styles.name}
                style={{
                  color: props.headingColor,
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: props.pragraphColor,
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>
          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "10") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div className={styles.box_main_flx}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            </div>
            <div className={styles.box_left_content}>
              <div
                className={styles.name}
                style={{
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>
          {!props.isSocialBoxHide ? (
            <div
              className={styles.social_icon_list}
              style={{
                backgroundColor: props.primaryColor,
                boxShadow: "-4px 9px 25px -6px" + props.primaryColor,
              }}
            >
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "11") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div className={styles.box_main_flx}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            </div>
            <div className={styles.box_left_content}>
              <div
                className={styles.name}
                style={{
                  color: props.headingColor,
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: props.pragraphColor,
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>

            {!props.isSocialBoxHide ? (
              <div className={styles.social_icon_list}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <a
                        key={icon.id}
                        target="_blank"
                        rel="noreferrer"
                        href={
                          icon.itype === "whatsapp"
                            ? "https://wa.me/" + icon.value
                            : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                              ? "mailto:" + icon.value
                              : icon.itype === "connect"
                                ? `sms:${icon.value || ""
                                }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                : icon.itype === "text"
                                  ? `sms:${icon.value || ""}`
                                  : icon.value
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                        ></span>
                      </a>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "12") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div className={styles.box_main_flx}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
              <span
                className={styles.theme_border}
                style={{ border: "5px solid" + props.primaryColor }}
              ></span>
            </div>
            <div className={styles.box_left_content}>
              <div
                className={styles.name}
                style={{
                  color: props.headingColor,
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: props.pragraphColor,
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>
          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              <div
                className={styles.social_icon_bg}
                style={{ border: "2px solid" + props.primaryColor }}
              >
                <span style={{ backgroundColor: props.primaryColor }}></span>
              </div>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "13") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div className={styles.box_main_flx}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            </div>
            <div className={styles.box_left_content}>
              <div
                className={styles.name}
                style={{
                  color: props.headingColor,
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: props.pragraphColor,
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>

            {!props.isSocialBoxHide ? (
              <div className={styles.social_icon_list}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <a
                        key={icon.id}
                        target="_blank"
                        rel="noreferrer"
                        href={
                          icon.itype === "whatsapp"
                            ? "https://wa.me/" + icon.value
                            : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                              ? "mailto:" + icon.value
                              : icon.itype === "connect"
                                ? `sms:${icon.value || ""
                                }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                : icon.itype === "text"
                                  ? `sms:${icon.value || ""}`
                                  : icon.value
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                        ></span>
                      </a>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "14") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div className={styles.box_main_flx}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            </div>
            <div className={styles.box_left_content}>
              <h3 className={styles.socialicons_heading}>Follow Me</h3>
              {!props.isSocialBoxHide ? (
                <div className={styles.social_icon_list}>
                  {props.socialIcons !== undefined
                    ? props.socialIcons
                      .filter((item) => item.status === 1)
                      .map((icon) => (
                        <a
                          key={icon.id}
                          target="_blank"
                          rel="noreferrer"
                          href={
                            icon.itype === "whatsapp"
                              ? "https://wa.me/" + icon.value
                              : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                                ? "mailto:" + icon.value
                                : icon.itype === "connect"
                                  ? `sms:${icon.value || ""
                                  }?body=${encodeURIComponent(icon.message)}
                                      ${process.env.APP_URL}${asPath}
                                      `
                                  : icon.itype === "text"
                                    ? `sms:${icon.value || ""}`
                                    : icon.value
                          }
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: icon.svg_code,
                            }}
                          ></span>
                        </a>
                      ))
                    : null}
                </div>
              ) : null}
            </div>
          </div>
          <div className={styles.profile_bg}>
            <div
              className={styles.profile_bg_wr}
              style={{
                backgroundColor: props.primaryColor,
                boxShadow: "-4px 9px 25px -6px" + props.primaryColor,
              }}
            >
              <div
                className={styles.name}
                style={{
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  } else if (props.htmlId == "15") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={styles.profile_bg}
            style={{ backgroundImage: props.defaultGradient }}
          ></div>
          <div className={styles.profile_main_fix}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            </div>
            <div className={styles.profile_content}>
              <div
                className={styles.name}
                style={{
                  color: props.headingColor,
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: props.pragraphColor,
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>
          <div className={styles.profile_details}>
            {!props.isSocialBoxHide ? (
              <div className={styles.social_icon_list}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <a
                        key={icon.id}
                        target="_blank"
                        rel="noreferrer"
                        href={
                          icon.itype === "whatsapp"
                            ? "https://wa.me/" + icon.value
                            : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                              ? "mailto:" + icon.value
                              : icon.itype === "connect"
                                ? `sms:${icon.value || ""
                                }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                : icon.itype === "text"
                                  ? `sms:${icon.value || ""}`
                                  : icon.value
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                        ></span>
                      </a>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "16") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div className={styles.box_main_flx}>
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            </div>
            <div className={styles.box_left_content}>
              <div
                className={styles.name}
                style={{
                  color: props.headingColor,
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: props.pragraphColor,
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>
          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "17") {
    return (
      <>

        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
          style={{ marginTop: "35px" }}
        >
          <CommonProfile {...props} />
          <div className={styles.box_main_flx}>
            {/* <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              <div className={styles.avatar_initial}>
                {getNameInitials(props.name)}
              </div>
              {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
            </div> */}
            <div className={styles.box_left_content}>
              <div
                className={styles.name}
                style={{
                  color: props.headingColor,
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: props.pragraphColor,
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>
          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "18") {
    return (
      <>
        <CommonProfile {...props} />
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >


          <div
            className={styles.name}
            style={{
              color: props.headingColor,
              fontFamily: props.headingFont ? props.headingFont : "Nunito",
            }}
          >
            {props.name}
          </div>
          <div
            className={styles.bg_subtitle_color}
            style={{ backgroundImage: props.defaultGradient }}
          >
            <div
              className={styles.tagline}
              style={{ fontFamily: props.textFont ? props.textFont : "Nunito" }}
            >
              <span style={{ backgroundImage: props.defaultGradient }}>
                {props.tagline}
              </span>
            </div>
          </div>
          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "19") {
    return (
      <>
        <CommonProfile {...props} />
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div style={{ textAlign: "center" }}>
            <div
              className={styles.name}
              style={{
                fontFamily: props.headingFont
                  ? props.headingFont
                  : "Nunito",
                textAlign: "center"
              }}
            >
              {props.name}
            </div>
            <div
              className={styles.tagline}
              style={{
                fontFamily: props.textFont ? props.textFont : "Nunito",
              }}
            >
              {props.tagline}
            </div>
          </div>
        </div>
        <div className={styles.socialicons__main}>
          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "20") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <CommonProfile {...props} />
          {/* <div className={styles.name_fix}> */}
          <div
            className={styles.name}
            style={{
              color: props.headingColor,
              fontFamily: props.headingFont ? props.headingFont : "Nunito",
            }}
          >
            {props.name}
          </div>
          <div
            className={styles.tagline}
            style={{
              color: props.pragraphColor,
              fontFamily: props.textFont ? props.textFont : "Nunito",
            }}
          >
            {props.tagline}
          </div>
          {/* </div> */}

          {/* <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
          >
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
          </div> */}

          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else if (props.htmlId == "21") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          <div
            className={styles.profile_bg}
            style={{
              backgroundImage: generateCoverV1(primaryColor, secondaryColor),
            }}
          >
            <div
              className={
                styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              }
            >
              {props.imageURL ? (
                <img
                  style={{ border: `5px solid ${props.primaryColor}` }}
                  src={props.imageURL}
                  alt=""
                />
              ) : (
                <div
                  className={styles.avatar_initial}
                  style={{
                    "--primary-color": props?.primaryColor,
                    "--secondary-color": props?.secondaryColor,
                  }}
                >
                  {getNameInitials(props.name)}
                </div>
              )}
            </div>
            <div className={styles.profile_bg_inner}>
              <div className={styles.profile_bg_content}>
                <div
                  className={styles.name}
                  style={{
                    fontFamily: props.headingFont
                      ? props.headingFont
                      : "Nunito",
                    "--primary-color": props?.primaryColor,
                    "--secondary-color": props?.secondaryColor,
                  }}
                >
                  <span className={styles.color_name}>
                    {props.name.split(" ").shift()}
                  </span>{" "}
                  <span>{props.name.split(" ").splice(1).join(" ")}</span>
                </div>
                <div
                  className={styles.tagline}
                  style={{
                    fontFamily: props.textFont ? props.textFont : "Nunito",
                    color: props?.secondaryColor,
                  }}
                >
                  {props.tagline}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${styles.socialicons__main}`}
            style={{ marginTop: "15px" }}
          >
            {!props.isSocialBoxHide ? (
              <div className={styles.icon_wrapper} style={{ gap: "0px" }}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <div>
                        <div
                          className={styles.icon_div}
                          style={{
                            "--primary-color": props?.primaryColor,
                            "--secondary-color": props?.secondaryColor,
                            maxWidth: "55px",
                            height: "55px",
                          }}
                        >
                          <a
                            key={icon.id}
                            target="_blank"
                            rel="noreferrer"
                            href={
                              icon.itype === "whatsapp"
                                ? "https://wa.me/" + icon.value
                                : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                                  ? "mailto:" + icon.value
                                  : icon.itype === "connect"
                                    ? `sms:${icon.value || ""
                                    }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                    : icon.itype === "text"
                                      ? `sms:${icon.value || ""}`
                                      : icon.value
                            }
                            className={styles.theme_21_icon}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: icon.svg_code,
                              }}
                            ></span>
                          </a>
                        </div>
                        <p
                          style={{
                            wordBreak: "break-word",
                            fontSize: "14px",
                          }}
                        >
                          {icon.name}
                        </p>
                      </div>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "22") {
    const iconLength = props.socialIcons.length;
    const lastElements = iconLength % 3;
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          {/* avatar */}
          <div
            className={`${styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              } ${styles.customAnimationLinear}`}
          >
            {/* <span></span>
            <span></span>
            <span></span>
            <span></span> */}
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
          </div>

          <div
            className={styles.profile_info}
            style={{
              boxShadow: "0px 0px 5px 0px rgba(182, 182, 182, 0.62)",
            }}
          >
            {/* name */}
            <div
              className={styles.name}
              style={{
                color: props.primaryColor || props.headingColor,
                // color: props.headingColor,
                fontFamily: props.headingFont ? props.headingFont : "Nunito",
              }}
            >
              {props.name}
            </div>
            {/* tagline */}
            <div
              className={styles.tagline}
              style={{
                color: props.primaryColor || props.headingColor,
                // color: props.pragraphColor,
                fontFamily: props.textFont ? props.textFont : "Nunito",
              }}
            >
              {props.tagline}
            </div>
          </div>
          <div className={styles.theme_22_icon_wrapper}>
            {!props.isSocialBoxHide ? (
              <div className={styles.social_icon_list}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon, index) => {
                      const isLastItem = index === iconLength - 1;
                      const isSecondLastItem = index === iconLength - 2;
                      let gridColumnSpan = "span 2";

                      if (
                        lastElements == 2 &&
                        (isLastItem || isSecondLastItem)
                      ) {
                        gridColumnSpan = "span 3";
                      }
                      if (lastElements == 1 && isLastItem) {
                        gridColumnSpan = "span 6";
                      }

                      return (
                        <a
                          key={icon.id}
                          target="_blank"
                          rel="noreferrer"
                          href={
                            icon.itype === "whatsapp"
                              ? "https://wa.me/" + icon.value
                              : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                                ? "mailto:" + icon.value
                                : icon.itype === "connect"
                                  ? `sms:${icon.value || ""
                                  }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                  : icon.itype === "text"
                                    ? `sms:${icon.value || ""}`
                                    : icon.value
                          }
                          style={{
                            gridColumn: gridColumnSpan,
                          }}
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: icon.svg_code,
                            }}
                          ></span>
                          <span>{icon.name}</span>
                        </a>
                      );
                    })
                  : null}
              </div>
            ) : null}
            <button
              onClick={() =>
                handleVCard(props, props.name, props.imageURL)
              }
              style={{ cursor: "pointer" }}
            >
              <svg
                fill="#FFF"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="18px"
                height="18px"
                viewBox="0 0 550.801 550.801"
                xmlSpace="preserve"
              >
                <g>
                  <path
                    d="M475.095,132c-0.032-2.529-0.833-5.023-2.568-6.993L366.324,3.694c-0.021-0.031-0.053-0.042-0.084-0.076
          c-0.633-0.707-1.36-1.29-2.141-1.804c-0.232-0.15-0.465-0.285-0.707-0.419c-0.686-0.369-1.393-0.67-2.131-0.892
          c-0.2-0.061-0.379-0.14-0.58-0.195C359.87,0.119,359.047,0,358.203,0H97.2C85.292,0,75.6,9.693,75.6,21.601v507.6
          c0,11.913,9.692,21.601,21.6,21.601H453.6c11.918,0,21.601-9.688,21.601-21.601V133.207C475.2,132.804,475.137,132.398,475.095,132
          z M186.677,513.19h-31.395l-38.106-118.905h29.46l14.468,50.282c4.061,14.106,7.765,27.695,10.584,42.514h0.535
          c2.998-14.285,6.694-28.407,10.755-41.981l15.175-50.805h28.576L186.677,513.19z M298.898,492.724
          c8.121,0,17.117-1.761,22.412-3.881l4.05,20.993c-4.936,2.474-16.052,5.121-30.512,5.121c-41.109,0-62.277-25.582-62.277-59.458
          c0-40.574,28.927-63.149,64.918-63.149c13.938,0,24.521,2.821,29.283,5.289l-5.463,21.342c-5.474-2.294-13.057-4.403-22.581-4.403
          c-21.347,0-37.932,12.878-37.932,39.34C260.798,477.731,274.909,492.724,298.898,492.724z M415.705,416.338h-45.689v27.164h42.688
          v21.879h-42.688v47.81h-26.989V394.285h72.679V416.338z M97.2,366.758V21.605h250.203v110.519c0,5.961,4.831,10.8,10.8,10.8H453.6
          l0.011,223.834H97.2z"
                  />
                  <g>
                    <path
                      d="M236.121,230.494c-7.56-2.66-7.626-5.318-7.626-5.318c-0.772-0.74-1.534-1.355-2.294-1.938
            c3.51-3.744,6.086-8.82,6.74-13.534c0.48-0.34,1.252-1.155,1.537-3.012c0,0,1.809-6.465-0.583-5.764
            c0.82-2.483,3.602-12.176-1.748-18.204c0,0-2.513-3.428-8.604-5.241c0,0-9.142-2.874-16.493-1.016
            c-7.354,1.864-7.53,3.381-9.555,10.368c0,0-1.519,3.617,0.49,14.212c-2.845-1.332-0.907,5.645-0.907,5.645
            c0.29,1.862,1.073,2.671,1.537,3.012c0.585,4.796,2.972,9.655,6.13,13.283c-1.505,1.237-2.371,2.268-2.371,2.268l-16.318,8.583
            c-4.461,1.727-6.347,4.303-6.347,4.303c-6.607,9.79-7.386,31.602-7.386,31.602c0.087,4.978,2.241,5.492,2.241,5.492
            c15.19,6.779,39.008,7.986,39.008,7.986c24.479,0.512,42.293-6.95,42.293-6.95c2.576-1.635,2.658-2.927,2.658-2.927
            c1.793-15.628-5.924-33.22-5.924-33.22C250.274,234.961,236.121,230.494,236.121,230.494z"
                    />
                    <path
                      d="M394.854,149.624H161.979c-4.179,0-7.57,3.391-7.57,7.578v144.683c0,4.187,3.391,7.572,7.57,7.572h232.875
            c4.177,0,7.573-3.386,7.573-7.572V157.201C402.427,153.015,399.041,149.624,394.854,149.624z M395.539,301.884
            c0,0.38-0.306,0.69-0.686,0.69H161.979c-0.38,0-0.686-0.311-0.686-0.69V157.201c0-0.379,0.306-0.69,0.686-0.69h232.875
            c0.38,0,0.686,0.311,0.686,0.69V301.884z"
                    />
                    <rect
                      x="278.416"
                      y="209.559"
                      width="95.08"
                      height="8.271"
                    />
                    <rect
                      x="278.416"
                      y="182.008"
                      width="95.08"
                      height="8.264"
                    />
                    <rect
                      x="278.416"
                      y="236.976"
                      width="95.08"
                      height="8.261"
                    />
                    <rect
                      x="278.416"
                      y="265.368"
                      width="71.661"
                      height="8.261"
                    />
                  </g>
                </g>
              </svg>
              <span> Save Contact</span>
            </button>
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "23") {
    return (
      <>
        <div
          className={`${styles.profile_wrapper} ${styles["html_theme_t" + props.htmlId]
            } ${props.isEditorPreview ? styles.editor_wrapper : ""}`}
          style={{ marginBottom: "-35px" }}
        >
          <div
            className={styles.profile_bg}
            style={{
              backgroundImage: generateCoverV3(
                tertiary_color,
                primaryColor,
                props?.bgColor
              ),
            }}
          >
            <div
              className={`${styles.avatar} ${props.imageURL ? styles.has_image : ""
                }`}
              style={{
                marginTop: props?.isEditorPreview ? "10px" : "0px",
                marginBottom: props?.isEditorPreview ? "20px" : "0px",
                position: props?.isEditorPreview ? "unset" : "relative",
                top: props?.isEditorPreview ? "unset" : "0.78rem",
              }}
            >
              {props.imageURL ? (
                <img
                  src={props.imageURL}
                  alt=""
                  style={
                    props?.isEditorPreview
                      ? { width: "6.5625rem", height: "6.5625rem" }
                      : {}
                  }
                />
              ) : (
                <div className={styles.avatar_initial}>
                  {getNameInitials(props.name)}
                </div>
              )}
            </div>
            <div
              className={styles.name}
              style={{
                color: primaryColor,
                fontFamily: props.headingFont || "Nunito",
                position: props?.isEditorPreview ? "unset" : "relative",
                top: props?.isEditorPreview ? "unset" : "1.5625rem",
              }}
            >
              {props.name}
            </div>
            <div
              className={styles.tagline}
              style={{
                color: secondaryColor,
                fontFamily: props.textFont || "Nunito",
                position: props?.isEditorPreview ? "unset" : "relative",
                top: props?.isEditorPreview ? "unset" : "1.125rem ",
              }}
            >
              {props.tagline}
            </div>
            {p.length > 0 && (
              <div
                className={styles.profile_details}
                style={{ margin: props?.isEditorPreview ? "unset" : "1rem" }}
              >
                <div
                  className={styles.pageContainer}
                  onMouseEnter={disableScroll} // Disable default scroll when mouse enters
                  onMouseLeave={enableScroll} // Enable default scroll when mouse leaves
                  onWheel={handleWheel} // Custom horizontal scroll
                >
                  {p.map(({ templateId, sectionData, _id }, index) => (
                    <div
                      key={index}
                      className={`${styles.relativeLink} ${(p.length === 1 || index === 0) && styles.firstElement
                        } ${index === p.length - 1 &&
                        p.length > 1 &&
                        styles.lastElement
                        }`}
                      style={{
                        background: tertiary_color,
                        zIndex: p.length - (index + 1),
                        marginLeft:
                          index !== 0 && index !== p.length - 1
                            ? "-1rem"
                            : undefined,
                      }}
                    >
                      <a
                        href={`/${query.link_preview}/${sectionData?.pageSlug}`}
                        key={_id}
                        className={`${query.id === sectionData?.pageSlug
                          ? styles.activeLink
                          : styles.defaultColorLink
                          }`}
                        style={{
                          color: props.bgColor,
                        }}
                      >
                        {sectionData.title}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "24") {
    return (
      <>
        <div
          className={`${styles.profile_wrapper} ${styles["html_theme_t" + props.htmlId]
            } ${props.isEditorPreview ? styles.editor_wrapper : ""}`}
          style={{ marginBottom: "-5px" }}
        >
          <div
            className={styles.profile_bg}
            style={{
              backgroundImage: generateCoverV4(tertiary_color, primaryColor),
              minHeight: props?.isEditorPreview ? "277px" : "330px",
            }}
          >
            <div
              className={`${styles.avatar} ${props.imageURL ? styles.has_image : ""
                }`}
              style={{
                marginTop: "-22%",
                border: `4px solid ${secondaryColor}`,
                borderRadius: "50%",
              }}
            >
              {props.imageURL ? (
                <img src={props.imageURL} alt="" />
              ) : (
                <div className={styles.avatar_initial}>
                  {getNameInitials(props.name)}
                </div>
              )}
            </div>

            <div
              style={{
                position: "relative",
                top: props?.isEditorPreview ? "15px" : "24px",
              }}
            >
              <div
                className={styles.name}
                style={{
                  color: primaryColor,
                  fontFamily: props.headingFont || "Nunito",
                }}
              >
                {props.name}
              </div>
              <div
                className={styles.tagline}
                style={{
                  color: secondaryColor,
                  fontFamily: props.textFont || "Nunito",
                  marginTop: "-8px",
                }}
              >
                {props.tagline}
              </div>
            </div>
            {p.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                  top: "25px",
                }}
              >
                <div
                  className={styles.links}
                  onMouseEnter={disableScroll} // Disable default scroll when mouse enters
                  onMouseLeave={enableScroll} // Enable default scroll when mouse leaves
                  onWheel={handleWheel} // Custom horizontal scroll
                >
                  {props?.sections
                    ?.filter((section) => section?.status)
                    ?.filter(
                      (section) => section?.sectionData?.pageType === "page"
                    )
                    .map(({ sectionData, _id, templateId }, index) => (
                      <a
                        style={{ padding: "5px 7px" }}
                        href={`/${query.link_preview}/${sectionData?.pageSlug}`}
                        key={_id}
                        className={`${query.id === sectionData?.pageSlug
                          ? styles.activeLink
                          : styles.defaultColorLink
                          }`}
                      >
                        {sectionData.title}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "25") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t_common"] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          {/* avatar */}
          <div
            className={`${styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              } ${styles.customAnimationLinear}`}
          >
            {props.imageURL ? (
              <img
                src={props.imageURL}
                alt=""
                style={{ width: "100%", height: "100%", borderRadius: "0" }}
              />
            ) : null}
          </div>
        </div>

        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t" + props.htmlId] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
        >
          {/* <div className={styles.profile_bg}>
           
          </div> */}

          <div className={styles.profile_bg_inner}>
            <div className={styles.profile_bg_content}>
              <div
                className={styles.name}
                style={{
                  fontFamily: props.headingFont ? props.headingFont : "Nunito",
                  "--primary-color": props?.primaryColor,
                  "--secondary-color": props?.secondaryColor,
                }}
              >
                <span className={styles.color_name}>
                  {props.name.split(" ").shift()}
                </span>{" "}
                <span>{props.name.split(" ").splice(1).join(" ")}</span>
              </div>
              <div
                className={styles.tagline}
                style={{
                  fontFamily: props.textFont ? props.textFont : "Nunito",
                  color: props?.secondaryColor,
                }}
              >
                {props.tagline}
              </div>
            </div>
          </div>

          <div
            className={`${styles.socialicons__main}`}
            style={{ marginTop: "15px" }}
          >
            {!props.isSocialBoxHide ? (
              <div className={styles.icon_wrapper} style={{ gap: "0px" }}>
                {props.socialIcons !== undefined
                  ? props.socialIcons
                    .filter((item) => item.status === 1)
                    .map((icon) => (
                      <div>
                        <div
                          className={styles.icon_div}
                          style={{
                            "--primary-color": props?.primaryColor,
                            "--secondary-color": props?.secondaryColor,
                            maxWidth: "55px",
                            height: "55px",
                          }}
                        >
                          <a
                            key={icon.id}
                            target="_blank"
                            rel="noreferrer"
                            href={
                              icon.itype === "whatsapp"
                                ? "https://wa.me/" + icon.value
                                : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                                  ? "mailto:" + icon.value
                                  : icon.itype === "connect"
                                    ? `sms:${icon.value || ""
                                    }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                                    : icon.itype === "text"
                                      ? `sms:${icon.value || ""}`
                                      : icon.value
                            }
                            className={styles.theme_21_icon}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: icon.svg_code,
                              }}
                            ></span>
                          </a>
                        </div>
                        <p
                          style={{
                            wordBreak: "break-word",
                            fontSize: "14px",
                          }}
                        >
                          {icon.name}
                        </p>
                      </div>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  } else if (props.htmlId == "26") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t_common"] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
          style={{ marginBottom: "5px" }}
        >
          {/* avatar */}
          <div
            className={`${styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              } ${styles.customAnimationLinear}`}
          >
            {props.imageURL ? (
              <img
                src={props.imageURL}
                alt=""
                style={{ width: "100%", height: "100%", borderRadius: "0" }}
              />
            ) : null}
          </div>
        </div>

        <div
          className={`${styles.profile_wrapper} ${styles["html_theme_t" + props.htmlId]
            } ${props.isEditorPreview ? styles.editor_wrapper : ""}`}
          style={{ marginBottom: "5px" }}
        >
          <div
            className={styles.name}
            style={{
              color: primaryColor,
              fontFamily: props.headingFont || "Nunito",
            }}
          >
            {props.name}
          </div>
          <div
            className={styles.tagline}
            style={{
              color: secondaryColor,
              fontFamily: props.textFont || "Nunito",
            }}
          >
            {props.tagline}
          </div>
          {p.length > 0 && (
            <div className={styles.profile_details}>
              <div
                className={styles.pageContainer}
                onMouseEnter={disableScroll} // Disable default scroll when mouse enters
                onMouseLeave={enableScroll} // Enable default scroll when mouse leaves
                onWheel={handleWheel} // Custom horizontal scroll
              >
                {p.map(({ templateId, sectionData, _id }, index) => (
                  <div
                    key={index}
                    className={`${styles.relativeLink} ${(p.length === 1 || index === 0) && styles.firstElement
                      } ${index === p.length - 1 &&
                      p.length > 1 &&
                      styles.lastElement
                      }`}
                    style={{
                      background: tertiary_color,
                      zIndex: p.length - (index + 1),
                      marginLeft:
                        index !== 0 && index !== p.length - 1
                          ? "-1rem"
                          : undefined,
                    }}
                  >
                    <a
                      href={`/${query.link_preview}/${sectionData?.pageSlug}`}
                      key={_id}
                      className={`${query.id === sectionData?.pageSlug
                        ? styles.activeLink
                        : styles.defaultColorLink
                        }`}
                      style={{
                        color: props.bgColor,
                      }}
                    >
                      {sectionData.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  } else if (props.htmlId == "27") {
    return (
      <>
        <div
          className={
            styles.profile_wrapper +
            " " +
            styles["html_theme_t_common"] +
            " " +
            (props.isEditorPreview === true ? styles.editor_wrapper : "")
          }
          style={{ marginBottom: "5px" }}
        >
          {/* avatar */}
          <div
            className={`${styles.avatar + " " + (props.imageURL ? styles.has_image : "")
              } ${styles.customAnimationLinear}`}
          >
            {props.imageURL ? (
              <img
                src={props.imageURL}
                alt=""
                style={{ width: "100%", height: "100%", borderRadius: "0" }}
              />
            ) : null}
          </div>
        </div>

        <div
          className={`${styles.profile_wrapper} ${styles["html_theme_t" + props.htmlId]
            } ${props.isEditorPreview ? styles.editor_wrapper : ""}`}
          style={{ marginBottom: "0" }}
        >
          <div>
            <div
              className={styles.name}
              style={{
                color: primaryColor,
                fontFamily: props.headingFont || "Nunito",
              }}
            >
              {props.name}
            </div>
            <div
              className={styles.tagline}
              style={{
                color: secondaryColor,
                fontFamily: props.textFont || "Nunito",
                marginTop: "-8px",
              }}
            >
              {props.tagline}
            </div>
          </div>
          {p.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                className={styles.links}
                onMouseEnter={disableScroll} // Disable default scroll when mouse enters
                onMouseLeave={enableScroll} // Enable default scroll when mouse leaves
                onWheel={handleWheel} // Custom horizontal scroll
              >
                {props?.sections
                  ?.filter((section) => section?.status)
                  ?.filter(
                    (section) => section?.sectionData?.pageType === "page"
                  )
                  .map(({ sectionData, _id, templateId }, index) => (
                    <a
                      style={{ padding: "5px 7px" }}
                      href={`/${query.link_preview}/${sectionData?.pageSlug}`}
                      key={_id}
                      className={`${query.id === sectionData?.pageSlug
                        ? styles.activeLink
                        : styles.defaultColorLink
                        }`}
                    >
                      {sectionData.title}
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  } else {
    return (
      <>
        <div
          className={
            styles.profile_wrapper + " " + styles["share_icon_t" + props.htmlId]
          }
        >
          <div
            className={
              styles.avatar + " " + (props.imageURL ? styles.has_image : "")
            }
            style={{ backgroundImage: props.defaultGradient }}
          >
            <div className={styles.avatar_initial}>
              {getNameInitials(props.name)}
            </div>
            {props.imageURL ? <img src={props.imageURL} alt="" /> : null}
          </div>
          <div
            className={styles.name}
            style={{
              color: props.headingColor,
              fontFamily: props.headingFont ? props.headingFont : "Nunito",
            }}
          >
            {props.name}
          </div>
          <div
            className={styles.tagline}
            style={{
              color: props.pragraphColor,
              fontFamily: props.textFont ? props.textFont : "Nunito",
            }}
          >
            {props.tagline}
          </div>

          {!props.isSocialBoxHide ? (
            <div className={styles.social_icon_list}>
              {props.socialIcons !== undefined
                ? props.socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? "https://wa.me/" + icon.value
                          : icon?.itype === "phone" ? `tel:${icon.value}` : icon.itype === "email"
                            ? "mailto:" + icon.value
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""
                              }?body=${encodeURIComponent(icon.message)}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      ></span>
                    </a>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </>
    );
  }
};

export default Profile;
