import { Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import svg from "../../../../helper/svg";
import { confirmPopupStatus } from "../../../../redux/actions/commonAction";
import {
  deleteSectionACT,
  duplicateSectionACT,
  editorAutoSaveStatus,
  updateSectionStatusACT,
} from "../../../../redux/actions/editorAction";
import Contact from "../elements/Contact";
import Email from "../elements/Email";
import Heading from "../elements/Heading";
import Images from "../elements/Images";
import Link from "../elements/Link";
import Messenger from "../elements/Messenger";
import Paragraph from "../elements/Paragraph";
import Phone from "../elements/Phone";
import Profile from "../elements/Profile";
import QRCode from "../elements/QRCode";
import SMS from "../elements/SMS";
import Skype from "../elements/Skype";
import Video from "../elements/Video";
import Whatsapp from "../elements/Whatsapp";
import styles from "./pageSection.module.css";
import Accordion from "../elements/Accordion";
import ImageSlider from "../elements/ImageSlider";

const PageSection = (props) => {
  let dispatch = useDispatch();
  const wrapperRef = useRef();
  const { secondaryColor, bgColor } = props || {};
  const [sectionTitle, setSectionTitle] = useState("");

  const elementBody = (elType) => {
    if (elType === "el_profile") return <Profile data={props.data} />;
    if (elType === "el_heading") return <Heading data={props.data} />;
    if (elType === "el_paragraph") return <Paragraph data={props.data} />;
    if (elType === "el_accordion") return <Accordion data={props.data} />;
    if (elType === "el_link")
      return (
        <Link
          data={props.data}
          bgColor={bgColor}
          secondaryColor={secondaryColor}
        />
      );
    if (elType === "el_image") return <Images data={props.data} />;
    if (elType === "el_qrcode") return <QRCode data={props.data} />;
    if (elType === "el_video") return <Video data={props.data} />;
    if (elType === "el_phone") return <Phone data={props.data} />;
    if (elType === "el_email") return <Email data={props.data} />;
    if (elType === "el_sms") return <SMS data={props.data} />;
    if (elType === "el_skype") return <Skype data={props.data} />;
    if (elType === "el_messenger") return <Messenger data={props.data} />;
    if (elType === "el_whatsapp") return <Whatsapp data={props.data} />;
    if (elType === "el_contact") return <Contact data={props.data} />;
    if (elType === "el_image_slider") return <ImageSlider data={props.data} />;
  };

  useEffect(() => {
    setSectionTitle(
      props.data.sectionData?.title || props.data.sectionData?.linkTitle
    );
    // if (props.data.type === "el_link") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_image") {
    //     setSectionTitle("Image");
    // } else if (props.data.type === "el_video") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_audio") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_phone") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_email") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_sms") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_skype") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_messenger") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else if (props.data.type === "el_whatsapp") {
    //     setSectionTitle(props.data.sectionData.title);
    // } else {
    //     setSectionTitle(props.data.sectionData.title);
    // }
  }, [props]);

  /* delete section start */
  const deleteSection = () => {
    if (props.data._id) {
      dispatch(
        confirmPopupStatus(true, {
          type: "Section",
          url: "",
          data: props.data._id,
          action: deleteAfterConfirm,
        })
      );
    }
  };
  const deleteAfterConfirm = async () => {
    if (props.data._id) {
      dispatch(confirmPopupStatus(false, {}));
      dispatch(editorAutoSaveStatus(true));
      dispatch(deleteSectionACT(props.data._id));
    }
  };
  /* delete section end */

  const duplicateSection = () => {
    if (props.data._id) {
      dispatch(duplicateSectionACT(props.data._id));
    }
  };

  /* accordion start */
  const accordionHandler = () => {
    if (wrapperRef.current.classList.contains(styles.active)) {
      wrapperRef.current.classList.remove(styles.active);
    } else {
      wrapperRef.current.classList.add(styles.active);
    }
    var el_id = "el_" + props.data._id;
    var elid = document.getElementById(el_id);
    if (elid) {
      elid.focus();
    }
  };
  /* accordion end */

  /* update section status start */
  const updateSectionStatus = (id, data) => {
    if (props.data._id) {
      dispatch(updateSectionStatusACT({ id, data }));
    }
  };
  /* update section status end */

  return (
    <>
      <div
        className={
          styles.wrapper +
          " " +
          (props.data.isDefault === 1 ? styles.active : "")
        }
        ref={wrapperRef}
      >
        <div className={styles.header}>
          <div
            className={styles.header_bg}
            onClick={(e) => accordionHandler()}
          ></div>
          <div
            className={styles.section_drag_icon}
            {...(props.dragprops
              ? { ...props.dragprops.dragHandleProps }
              : null)}
          >
            <span></span>
            <span></span>
          </div>

          <div
            className={styles.section_icon}
            onClick={(e) => accordionHandler()}
          >
            {svg["icon_" + props.data.type]}
          </div>

          <div
            className={styles.section_title + " " + styles[props.data.type]}
            onClick={(e) => accordionHandler()}
          >
            <span>{sectionTitle && sectionTitle.replace(/<[^>]+>/g, "")}</span>
          </div>

          <div className={styles.section_actions}>
            {!props.data.isDefault === true ? (
              <>
                <Tooltip title="Clone Element" placement="top" arrow>
                  <div
                    className="pu_btn_icon"
                    onClick={(e) => duplicateSection(e)}
                  >
                    {svg.icon_duplicate}
                  </div>
                </Tooltip>
                <Tooltip
                  title={
                    (props.data.status === 0 ? "Show" : "Hide") + " Element"
                  }
                  placement="top"
                  arrow
                >
                  <div className="pu_switch">
                    <input
                      type="checkbox"
                      id={"section_" + props.data._id}
                      defaultChecked={props.data.status === 1 ? true : false}
                      onClick={(e) =>
                        updateSectionStatus(
                          props.data._id,
                          props.data.status === 1 ? 0 : 1
                        )
                      }
                    />
                    <label htmlFor={"section_" + props.data._id}>
                      <div className="pu_switch_icon"></div>
                    </label>
                  </div>
                </Tooltip>
                <Tooltip title="Delete Element" placement="top" arrow>
                  <div className="pu_btn_icon" onClick={(e) => deleteSection()}>
                    {svg.icon_delete}
                  </div>
                </Tooltip>
              </>
            ) : null}
            <div
              className={styles.section_accordion_icon}
              onClick={(e) => accordionHandler()}
            ></div>
          </div>
        </div>
        <div className={styles.body}>{elementBody(props.data.type)}</div>
      </div>
    </>
  );
};
export default PageSection;
