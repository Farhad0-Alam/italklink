import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import Head from "next/head";
import styles from "../../../styles/pages/Preview.module.css";
import Contact from "./elementPreviewTemplates/contact/contact";
import EmailElement from "./elementPreviewTemplates/email/Email";
import Heading from "./elementPreviewTemplates/heading/Heading";
import Images from "./elementPreviewTemplates/images/Images";
import LinkElement from "./elementPreviewTemplates/link/Link";
import MessengerElement from "./elementPreviewTemplates/messenger/Messenger";
import Paragraph from "./elementPreviewTemplates/paragraph/Paragraph";
import PhoneElement from "./elementPreviewTemplates/phone/Phone";
import Profile from "./elementPreviewTemplates/profile/Profile";
import QRCode from "./elementPreviewTemplates/qrcode/QRCode";
import ShareIcon from "./elementPreviewTemplates/share_icon/ShareIcon";
import SkypeElement from "./elementPreviewTemplates/skype/Skype";
import SMSElement from "./elementPreviewTemplates/sms/SMS";
import VideoPreview from "./elementPreviewTemplates/video/video";
import WhatsappElement from "./elementPreviewTemplates/whatsapp/Whatsapp";
import Accordion from "./elementPreviewTemplates/common/accordion/Accordion";
import ShareButtonV1 from "./_components/ShareButtonV1";
import ShareButtonV1_2 from "./_components/ShareButtonV1_2";
import ContactVcard from "./_components/ContactVcard";
import InstallPWA from "../ui/InstallPWA";
import ImageSlider from "./elementPreviewTemplates/image-slider/ImageSlider";

const ElementPreview = (props) => {

  const router = useRouter();
  const [pageData, setPageData] = useState([]);
  const { asPath } = router;

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [bgColor, setBgColor] = useState("");
  const [headingColor, setHeadingColor] = useState("");
  const [headingFont, setHeadingFont] = useState("");
  const [headingFontSize, setHeadingFontSize] = useState("");
  const [headingFontWeight, setHeadingFontWeight] = useState("");

  const [textColor, setTextColor] = useState("");
  const [textFont, setTextFont] = useState("");
  const [textFontSize, setTextFontSize] = useState("");
  const [textFontWeight, setTextFontWeight] = useState("");

  const [tempId, setTempId] = useState("");

  const [socialIcons, setSocialIcons] = useState([]);

  const [gradientStatus, setGradientStatus] = useState("");
  const [gradient, setGradient] = useState("");

  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [defaultGradientStatus, setDefaultGradientStatus] = useState("");
  const [defaultGradient, setDefaultGradient] = useState("");

  const [isSocialBoxHide, setIsSocialBoxHide] = useState(false);

  const [url, setUrl] = useState("");
  const [size, setSize] = useState("");

  const [shareIconPageUrl, setshareIconPageUrl] = useState("");
  const [htmlThemeId, setHtmlThemeId] = useState("");

  const [boxCss, setBoxCss] = useState({});
  const [pages, setPages] = useState([]);

  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  useEffect(() => {
    /* update section list state start */
    setPageData(props.sections);
    /* update section list state end */

    /* update tempId state start */
    if (props.template) {
      setTempId(props.template._id);
    }
    /* update tempId state end */

    /* update social icon state start */
    if (props.template) {
      if (props.template) {
        if (props.template.SocialIconData) {
          const data = props.template.SocialIconData.filter(
            (item) => item.status === 1
          );
          if (data.length === 0) {
            setIsSocialBoxHide(true);
          } else {
            setIsSocialBoxHide(false);
          }
        }
        setSocialIcons(props.template.SocialIconData);
      }
    }
    /* update social icon state end */

    /* update profile state start */
    const profile = props.template ? props.template.profile : "";
    if (profile) {
      setName(profile.name);
      setTagline(profile.tagline);
      setImageURL(profile.image ? process.env.s3URL + profile.image : "");
    }
    /* update profile state end */

    /* update style state start */
    const data = props.template ? props.template.templateStyle : "";
    if (data) {
      setBgColor(data.bgcolor);
      setHeadingColor(data.headingcolor);
      setHeadingFont(data.headingfont);
      setHeadingFontSize(data.headingsize);
      setHeadingFontWeight(data.headingfontweight);
      setTextColor(data.textcolor);
      setTextFont(data.textfont);
      setTextFontSize(data.textsize);
      setTextFontWeight(data.textfontweight);

      setPrimaryColor(data.primary_color);
      setSecondaryColor(data.secondary_color);
      setDefaultGradient(data.default_gradient);

      if (data.bg_gradient) {
        setGradientStatus(data.bg_gradient.status);
        var gcss = "";
        if (data.bg_gradient.type === "linear") {
          gcss =
            "linear-gradient(" +
            data.bg_gradient.angle +
            "deg," +
            data.bg_gradient.colors.map(
              (gcolor) => gcolor.color + " " + gcolor.stop + "%"
            ) +
            ")";
        } else {
          gcss =
            "radial-gradient(circle," +
            data.bg_gradient.colors.map(
              (gcolor) => gcolor.color + " " + gcolor.stop + "%"
            ) +
            ")";
        }
        setGradient(gcss);
      }
      if (data.default_gradient) {
        setDefaultGradientStatus(data.default_gradient.status);
        var gcss = "";
        if (data.default_gradient.type === "linear") {
          gcss =
            "linear-gradient(" +
            data.default_gradient.angle +
            "deg," +
            data.default_gradient.colors.map(
              (gcolor) => gcolor.color + " " + gcolor.stop + "%"
            ) +
            ")";
        } else {
          gcss =
            "radial-gradient(circle," +
            data.default_gradient.colors.map(
              (gcolor) => gcolor.color + " " + gcolor.stop + "%"
            ) +
            ")";
        }
        setDefaultGradient(gcss);
      }

      if (data.bgimage) {
        setUrl(data.bgimage.url);
        setSize(data.bgimage.size);
      }
    }
    /* update style state end */

    if (props.template) {
      setHtmlThemeId(props.template.html_theme_id);
    }

    if (htmlThemeId) {
    }
  }, [props]);

  /* content box css start */
  useEffect(() => {
    if (htmlThemeId === "2") {
      setBoxCss({
        backgroundColor: secondaryColor,
        padding: 15,
        borderRadius: 15,
      });
    } else {
      setBoxCss({});
    }
  }, [htmlThemeId]);
  /* content box css end */

  useEffect(() => {
    if (router.query.link_preview) {
      setshareIconPageUrl(process.env.APP_URL + router.query.link_preview);
    }
  }, [router.query]);

  function extractScriptSrc(scriptTag) {
    const srcRegex = /src="([^"]+)"/;
    const match = scriptTag.match(srcRegex);
    if (match && match[1]) {
      return match[1];
    } else {
      return null;
    }
  }

  return (
    <>
      <div
        className={styles.template_bg + " " + styles["theme_" + htmlThemeId]}
        style={{
          position: props.editorPreview === true ? "absolute" : "fixed",
          top: props.editorPreview === true ? 10 : 0,
          left: props.editorPreview === true ? 10 : 0,
          right: props.editorPreview === true ? 10 : 0,
          bottom: props.editorPreview === true ? 10 : 0,
          backgroundColor: bgColor ? bgColor : "#ffebd5",
          backgroundImage: gradientStatus === 1 ? gradient : "none",
          zIndex: props.editorPreview === true ? 0 : -1,
          borderRadius: props.editorPreview === true ? 60 : 0,
        }}
      >
        <div className={styles.bg_pattern}></div>
      </div>
      <div
        className={
          styles.wrapper +
          " " +
          styles["theme_" + htmlThemeId] +
          " " +
          (props.editorPreview === true ? styles.editor_wrapper : "")
        }
        style={{
          "--primary-color": primaryColor,
          "--secondary-color": secondaryColor,
          "--bg-color": gradientStatus === 1 ? gradient : bgColor,
        }}
      >
        {["21", "22", "23", "24", "25", "26", "27"].includes(htmlThemeId) !==
          true && (
            <ShareIcon
              name={name}
              tagline={tagline}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              defaultGradient={defaultGradient}
              pageUrl={shareIconPageUrl ? shareIconPageUrl : ""}
              htmlId={htmlThemeId}
              isEditorPreview={props.editorPreview}
              {...props}
            />
          )}

        <Profile
          name={name}
          tagline={tagline}
          imageURL={imageURL}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          pragraphColor={textColor}
          defaultGradient={defaultGradient}
          htmlId={htmlThemeId}
          bgColor={bgColor}
          textFont={textFont}
          headingFont={headingFont}
          isEditorPreview={props.editorPreview}
          isSocialBoxHide={isSocialBoxHide}
          socialIcons={socialIcons}
          sections={pageData}
          props={props}
        />

        {(htmlThemeId == "21" || htmlThemeId == "25") && (
          <div className={styles.contact_wrapper}>
            <ContactVcard
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              defaultGradient={defaultGradient}
              name={name}
              styles={styles}
              {...props}
            />
            <ShareButtonV1_2
              defaultGradient={defaultGradient}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              styles={styles}
              name={name}
              {...props}
            />
          </div>
        )}

        {props.validity === undefined
          ? props.adEnable
            ? props.adEnable == true && (
              <Head>
                {props.adScript && (
                  <script
                    async
                    src={extractScriptSrc(props.adScript)}
                    crossorigin="anonymous"
                  ></script>
                )}
              </Head>
            )
            : null
          : ""}

        {props.validity === undefined &&
          props.adEnable &&
          props.adEnable == true ? (
          <div
            style={{ overflow: "hidden" }}
            className={styles.element_box}
            dangerouslySetInnerHTML={{
              __html: props.adScriptCode,
            }}
          ></div>
        ) : (
          ""
        )}

        {["23", "24", "26", "27"].includes(htmlThemeId) === true &&
          pageData
            .filter(
              (item) =>
                item.type === "el_link" &&
                item?.sectionData?.pageType !== "page"
            )
            .map((item) => (
              <>
                <LinkElement
                  props={props}
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              </>
            ))}

        {["22"].includes(htmlThemeId) &&
          pageData?.filter((item) => item.type === "el_accordion").length >
          0 && (
            <div className={styles.accordion_group}>
              {pageData
                .filter((item) => item.type === "el_accordion")
                .map((item) => (
                  <Accordion
                    key={item._id} // Always use a unique key for list rendering
                    item={item}
                    title={item.sectionData.title}
                    description={item.sectionData.description}
                    tempId={tempId}
                    templateStyle={props.template.templateStyle}
                    pageId={props.page._id}
                    isAdmin={props.isAdmin}
                    linkSlug={props.linkSlug}
                    htmlId={htmlThemeId}
                    textFont={textFont}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    defaultGradient={defaultGradient}
                    isEditorPreview={props.editorPreview}
                    headingFont={headingFont}
                  />
                ))}
            </div>
          )}

        {["23", "24", "26", "27"].includes(htmlThemeId) === true &&
          !isSocialBoxHide ? (
          <div>
            <h3
              className={styles.socialIcons_heading}
              style={{ color: secondaryColor }}
            >
              Connect with me{" "}
            </h3>
            <div
              className={styles.social_icon_list}
              style={{
                "--icon-size": props.editorPreview ? "25px" : "32px",
              }}
            >
              {socialIcons &&
                socialIcons
                  .filter((item) => item.status === 1)
                  .map((icon) => (
                    <a
                      key={icon.id}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        icon.itype === "whatsapp"
                          ? `https://wa.me/${icon.value}`
                          : icon.itype === "email"
                            ? `mailto:${icon.value}`
                            : icon.itype === "connect"
                              ? `sms:${icon.value || ""}?body=${encodeURIComponent(
                                icon.message
                              )}
                                    ${process.env.APP_URL}${asPath}
                                    `
                              : icon.itype === "text"
                                ? `sms:${icon.value || ""}`
                                : icon?.itype === "phone" ? `tel:${icon?.value}` : icon.value
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: icon.svg_code }}
                      />
                    </a>
                  ))}
            </div>
          </div>
        ) : null}

        <div className={styles.element_box} style={boxCss}>
          {pageData.map((item) => (
            <React.Fragment key={item._id}>
              {item.type == "el_heading" && item.status === 1 ? (
                <>
                  <Heading
                    item={item}
                    htmlId={htmlThemeId}
                    headingColor={headingColor}
                    headingFont={headingFont}
                    headingFontSize={headingFontSize}
                    headingFontWeight={headingFontWeight}
                    isEditorPreview={props.editorPreview}
                  />
                </>
              ) : null}
              {item.type == "el_paragraph" && item.status === 1 ? (
                <>
                  <Paragraph
                    item={item}
                    htmlId={htmlThemeId}
                    textColor={textColor}
                    textFont={textFont}
                    textFontSize={textFontSize}
                    textFontWeight={textFontWeight}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    isEditorPreview={props.editorPreview}
                  />
                </>
              ) : null}
              {["23", "24", "26", "27"].includes(htmlThemeId) !== true &&
                item.type === "el_link" &&
                item.status === 1 ? (
                <LinkElement
                  props={props}
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_image" && item.status === 1 ? (
                <Images
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_qrcode" && item.status === 1 ? (
                <QRCode
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_video" && item.status === 1 ? (
                <VideoPreview
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_phone" && item.status === 1 ? (
                <PhoneElement
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_email" && item.status === 1 ? (
                <EmailElement
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_whatsapp" && item.status === 1 ? (
                <WhatsappElement
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_sms" && item.status === 1 ? (
                <SMSElement
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_skype" && item.status === 1 ? (
                <SkypeElement
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_messenger" && item.status === 1 ? (
                <MessengerElement
                  item={item}
                  tempId={tempId}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_contact" && item.status === 1 ? (
                <Contact
                  item={item}
                  tempId={tempId}
                  templateStyle={props.template.templateStyle}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {item.type === "el_image_slider" && item.status === 1 ? (
                <ImageSlider
                  item={item}
                  tempId={tempId}
                  templateStyle={props.template.templateStyle}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                />
              ) : null}
              {["22"].includes(htmlThemeId) !== true &&
                item.type === "el_accordion" &&
                item.status === 1 ? (
                <Accordion
                  item={item}
                  title={item.sectionData.title}
                  description={item.sectionData.description}
                  tempId={tempId}
                  templateStyle={props.template.templateStyle}
                  pageId={props.page._id}
                  isAdmin={props.isAdmin}
                  linkSlug={props.linkSlug}
                  htmlId={htmlThemeId}
                  textFont={textFont}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  defaultGradient={defaultGradient}
                  isEditorPreview={props.editorPreview}
                  headingFont={headingFont}
                  props={props}
                />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>

      {!props?.editorPreview &&
        [22, 23, 24, 26, 27].includes(parseInt(htmlThemeId)) && (
          <>
            <ShareButtonV1
              name={name}
              {...props}
              isEditorPreview={props.isEditorPreview}
            />
          </>
        )}

      {!props?.editorPreview && <InstallPWA {...props} />}
    </>
  );
};
export default ElementPreview;
