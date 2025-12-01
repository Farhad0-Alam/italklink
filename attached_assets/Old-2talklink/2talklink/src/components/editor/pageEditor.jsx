import { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { connect, useDispatch, useSelector } from "react-redux";
import { compose } from "redux";
import { icons } from "../../../icons/icons";
import styles from "../../../styles/editor/pageEditor.module.css";
import { common } from "../../helper/Common";
import svg from "../../helper/svg";
import { confirmPopupStatus } from "../../redux/actions/commonAction";
import {
  addSectionACT,
  deletePageACT,
  editorAutoSaveStatus,
  profileUpdateACT,
  reorderSectionListACT,
  updatePageListACT,
} from "../../redux/actions/editorAction";
import Popup from "../common/popup/Popup";
import PageSection from "./pageElements/section/pageSection";
const customIcons = icons({ height: "60px", width: "60px" });

import { Tooltip } from "@mui/material";
import ContentLoader from "react-content-loader";
import InputImageUploader from "../common/elements/inputImageUploader";
import RenamePage from "./renamePage";
import { getSingleUserBayedPlan } from "../../../utils/queries";

const pageEditor = (props) => {
  const secondaryColor = props?.editorData?.templateStyle?.secondary_color;
  const bgcolor = props?.editorData?.templateStyle?.bgcolor;

  let dispatch = useDispatch();
  const profileWrapperRef = useRef();

  let elementList = [
    {
      id: 1,
      title: "Heading",
      type: "el_heading",
      status: 1,
      icon: "icon_el_heading",
      defaultValue: "Default Heading",
    },
    {
      id: 2,
      title: "Paragraph",
      type: "el_paragraph",
      status: 1,
      icon: "icon_el_paragraph",
      defaultValue: {
        paragraph:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim..",
        title: "",
      },
    },
    {
      id: 3,
      title: "Link",
      type: "el_link",
      status: 1,
      icon: "icon_el_link",
      defaultValue: {
        title: "Title Here",
        type: "link",
        pageType: "link",
        fullURL: "",
        pageSlug: "home",
        url: "",
        openNewTab: false,
      },
    },
    {
      id: 4,
      title: "Image",
      type: "el_image",
      status: 1,
      icon: "icon_el_image",
      defaultValue: {
        title: "",
      },
    },
    {
      id: 5,
      title: "Social Icons",
      type: "el_social_icons",
      status: 0,
      icon: "icon_el_social_icons",
      defaultValue: "This is the default social_icons.",
    },
    {
      id: 6,
      title: "Gallery",
      type: "el_gallery",
      status: 0,
      icon: "icon_el_gallery",
      defaultValue: "This is the default gallery.",
    },
    {
      id: 7,
      title: "QRCode",
      type: "el_qrcode",
      status: 1,
      icon: "icon_el_qrcode",
      defaultValue: {
        title: "",
        url: "",
      },
    },
    {
      id: 8,
      title: "Video",
      type: "el_video",
      status: 1,
      icon: "icon_el_video",
      defaultValue: {
        title: "Add Video URL here.",
        url: "",
        dynamicTitle: "",
      },
    },
    {
      id: 9,
      title: "SoundCloud",
      type: "el_audio",
      status: 0,
      icon: "icon_el_video",
      defaultValue: {
        title: "Add SoundCloud Audio URL here.",
        url: "",
      },
    },
    {
      id: 900,
      title: "Contact Form",
      type: "el_contact",
      status: 1,
      icon: "icon_el_contact",
      defaultValue: {
        title: "Add Contact Title here",
      },
    },
    {
      id: 111,
      title: "Location",
      type: "el_location",
      status: 0,
      icon: "icon_el_location",
      defaultValue: {
        title: "Add Location Title here",
        address: "",
      },
    },
    {
      id: 2012,
      title: "Accordion",
      type: "el_accordion",
      status: 1,
      icon: "icon_el_accordion",
      defaultValue: {
        title: "Lorem ipsum",
        description:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim..",
      },
    },
    {
      id: 2024,
      title: "Image Slider",
      type: "el_image_slider",
      status: 1,
      icon: "icon_el_image_slider",
      defaultValue: {
        title: "Lorem ipsum",
        description:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim..",
      },
    },
    // New elements
    // {
    //     id: 1011,
    //     title: "Phone",
    //     type: "el_phone",
    //     status: 0,
    //     icon: "icon_el_phone",
    //     defaultValue: {
    //         title: "Phone",
    //         type: "phone",
    //         fullURL: "",
    //         pageSlug: "phone",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1012,
    //     title: "Email",
    //     type: "el_email",
    //     status: 0,
    //     icon: "icon_el_email",
    //     defaultValue: {
    //         title: "Email",
    //         type: "email",
    //         fullURL: "",
    //         pageSlug: "email",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1013,
    //     title: "SMS",
    //     type: "el_sms",
    //     status: 0,
    //     icon: "icon_el_sms",
    //     defaultValue: {
    //         title: "Text",
    //         type: "sms",
    //         fullURL: "",
    //         pageSlug: "sms",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1014,
    //     title: "WhatsApp",
    //     type: "el_whatsapp",
    //     status: 0,
    //     icon: "icon_el_whatsapp",
    //     defaultValue: {
    //         title: "WhatsApp",
    //         type: "whatsapp",
    //         fullURL: "",
    //         pageSlug: "whatsapp",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1015,
    //     title: "Skype",
    //     type: "el_skype",
    //     status: 0,
    //     icon: "icon_el_skype",
    //     defaultValue: {
    //         title: "Skype",
    //         type: "skype",
    //         fullURL: "",
    //         pageSlug: "skype",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1016,
    //     title: "Messenger",
    //     type: "el_messenger",
    //     status: 0,
    //     icon: "icon_el_messenger",
    //     defaultValue: {
    //         title: "Messenger",
    //         type: "messenger",
    //         fullURL: "",
    //         pageSlug: "messenger",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1017,
    //     title: "Facebook",
    //     type: "el_facebook",
    //     status: 0,
    //     icon: "icon_el_facebook",
    //     defaultValue: {
    //         title: "Facebook",
    //         type: "facebook",
    //         fullURL: "",
    //         pageSlug: "facebook",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1018,
    //     title: "Instagram",
    //     type: "el_instagram",
    //     status: 0,
    //     icon: "icon_el_instagram",
    //     defaultValue: {
    //         title: "Instagram",
    //         type: "instagram",
    //         fullURL: "",
    //         pageSlug: "instagram",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1019,
    //     title: "Google Calendar",
    //     type: "el_calender",
    //     status: 0,
    //     icon: "icon_el_calender",
    //     defaultValue: {
    //         title: "Google Calendar",
    //         type: "calender",
    //         fullURL: "",
    //         pageSlug: "calender",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1020,
    //     title: "YouTube",
    //     type: "el_youtube",
    //     status: 0,
    //     icon: "icon_el_youtube",
    //     defaultValue: {
    //         title: "YouTube",
    //         type: "youtube",
    //         fullURL: "",
    //         pageSlug: "youtube",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1021,
    //     title: "TikTok",
    //     type: "el_tiktok",
    //     status: 0,
    //     icon: "icon_el_tiktok",
    //     defaultValue: {
    //         title: "TikTok",
    //         type: "tiktok",
    //         fullURL: "",
    //         pageSlug: "tiktok",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1022,
    //     title: "WeChat",
    //     type: "el_wechat",
    //     status: 0,
    //     icon: "icon_el_wechat",
    //     defaultValue: {
    //         title: "WeChat",
    //         type: "wechat",
    //         fullURL: "",
    //         pageSlug: "wechat",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1023,
    //     title: "LinkedIn",
    //     type: "el_linkedin",
    //     status: 0,
    //     icon: "icon_el_linkedin",
    //     defaultValue: {
    //         title: "LinkedIn",
    //         type: "linkedin",
    //         fullURL: "",
    //         pageSlug: "linkedin",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1024,
    //     title: "X",
    //     type: "el_x",
    //     status: 0,
    //     icon: "icon_el_x",
    //     defaultValue: {
    //         title: "X",
    //         type: "x",
    //         fullURL: "",
    //         pageSlug: "x",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1025,
    //     title: "Snapchat",
    //     type: "el_snapchat",
    //     status: 0,
    //     icon: "icon_el_snapchat",
    //     defaultValue: {
    //         title: "Snapchat",
    //         type: "snapchat",
    //         fullURL: "",
    //         pageSlug: "snapchat",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
    // {
    //     id: 1026,
    //     title: "Pinterest",
    //     type: "el_pinterest",
    //     status: 0,
    //     icon: "icon_el_pinterest",
    //     defaultValue: {
    //         title: "Pinterest",
    //         type: "pinterest",
    //         fullURL: "",
    //         pageSlug: "pinterest",
    //         url: "",
    //         openNewTab: false,
    //     },
    // },
  ];
  const [addElementPopup, setAddElementPopup] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileTagline, setProfileTagline] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [sectionList, setSectionList] = useState([]);

  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    let propSections = props.sectionList;
    if (propSections.length) {
      setSectionList(propSections);
    } else {
      setSectionList([]);
    }

    if (props.pageData) {
      setPageTitle(props.pageData.title);
    }
  }, [props]);

  /* delete page action start */
  const deletePage = (e) => {
    var pid = props.pageData._id;
    if (pid) {
      dispatch(
        confirmPopupStatus(true, {
          type: "Page",
          url: "editor/deleteTemplatePage",
          data: { id: pid },
          action: closeConfirmPopup,
        })
      );
    }
  };
  /* delete page action end */

  /* close confirm popup after delete start */
  const closeConfirmPopup = () => {
    if (props.pageData) {
      const deletedPageId = props.pageData._id;
      dispatch(deletePageACT(deletedPageId));
      dispatch(confirmPopupStatus(false, {}));
    }
  };
  /* close confirm popup after delete end */

  const elementPopupCloseHandler = (e) => {
    setAddElementPopup(false);
  };

  useEffect(() => {
    if (props.editorData) {
      if (props.editorData.profile) {
        setProfileName(
          props.editorData.profile.name ? props.editorData.profile.name : ""
        );
        setProfileTagline(
          props.editorData.profile.tagline
            ? props.editorData.profile.tagline
            : ""
        );
        setProfileImage(
          props.editorData.profile.image ? props.editorData.profile.image : ""
        );
      }
    }
  }, [props.editorData]);

  /* add element start */
  const addElement = (el) => {
    var activePageId = props.pageData._id;
    if (activePageId) {
      elementPopupCloseHandler();
      dispatch(editorAutoSaveStatus(true));
      const data = {
        page_id: activePageId,
        template_id: props.templateId,
        title: el.title,
        type: el.type,
        sectionData: el.defaultValue,
      };
      dispatch(addSectionACT(data));
    }
  };
  /* add element end */

  // a little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };
  const sectionDragHandle = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      sectionList,
      result.source.index,
      result.destination.index
    );
    setSectionList(items);
    /* send section list to store start */
    dispatch(editorAutoSaveStatus(true));
    dispatch(reorderSectionListACT(items));
    /* send section list to store end */
  };

  /* accordion start */
  const accordionHandler = () => {
    if (profileWrapperRef.current.classList.contains(styles.active)) {
      profileWrapperRef.current.classList.remove(styles.active);
    } else {
      profileWrapperRef.current.classList.add(styles.active);
    }
  };
  /* accordion end */

  const updateProfileName = (e) => {
    const data = { ...props.editorData.profile };
    setProfileName(e.target.value);
    if (data.name !== profileName) {
      data.name = profileName;
      const newData = {
        template_id: props.editorData._id,
        profile_data: data,
      };
      dispatch(profileUpdateACT(newData));
    }
  };
  const updateProfileTagline = (e) => {
    const data = { ...props.editorData.profile };
    if (data.tagline !== profileTagline) {
      data.tagline = profileTagline;
      const newData = {
        template_id: props.editorData._id,
        profile_data: data,
      };
      dispatch(profileUpdateACT(newData));
    }
  };

  const duplicatePage = (id) => {
    if (id) {
      var pagesCopy = [...props.pages];
      common.getAPI(
        {
          method: "POST",
          url: "editor/duplicatePage",
          data: {
            page_id: id,
          },
        },
        (resp) => {
          if (resp.status === "success") {
            var newPages = [...pagesCopy, resp.data];
            dispatch(updatePageListACT(newPages));
          }
        }
      );
    }
  };

  const userData = useSelector((selector) => selector.userData);
  const isAdmin = userData?.role === 1;

  const [planDetails, setPlanDetails] = useState(null);
  useEffect(() => {
    if (!isAdmin) {
      getSingleUserBayedPlan((planDetails) => {
        setPlanDetails(planDetails);
      });
    }
  }, []);

  const featuresIds = planDetails?.features || [];

  return (
    <>
      {!props.content_placeholder.pageData ? (
        <>
          <div className={styles.header}>
            <div className={styles.header_title}>
              <h3>
                {props.pageData ? props.pageData.title : "Loading"}
                {props.pageData.isDefault === 1 ? <span>(Default)</span> : ""}
              </h3>
              {props.pageData.isDefault === 0 ? (
                <div className={styles.header_title_action}>
                  <RenamePage data={props.pageData} />
                  <Tooltip title="Clone Page" placement="top" arrow>
                    <div
                      className="pu_btn_icon"
                      onClick={() => duplicatePage(props.pageData._id)}
                    >
                      {svg.icon_duplicate}
                    </div>
                  </Tooltip>
                  {/* <div className="pu_switch">
                                        <input type="checkbox" id="page_status_switch" />
                                        <label htmlFor="page_status_switch">
                                            <div className="pu_switch_icon"></div>
                                        </label>
                                    </div> */}
                  <Tooltip title="Delete Page" placement="top" arrow>
                    <div className="pu_btn_icon" onClick={(e) => deletePage(e)}>
                      {svg.icon_delete}
                    </div>
                  </Tooltip>
                </div>
              ) : null}
            </div>
            <div className={styles.header_btns}>
              <button
                className={"pu_btn " + styles.btn}
                onClick={(e) => setAddElementPopup(!addElementPopup)}
              >
                {svg.btn_add_icon} Add New Element
              </button>
            </div>
          </div>

          <div className={styles.page_section_list}>
            {props.pageData.isDefault === 1 ? (
              <div
                className={styles.profile_wrapper + " " + styles.active}
                ref={profileWrapperRef}
              >
                <div
                  className={styles.profile_header}
                  onClick={(e) => accordionHandler()}
                >
                  <div className={styles.profile_section_icon}>
                    {svg.icon_el_profile}
                  </div>

                  <div className={styles.profile_section_title}>Profile</div>

                  <div className={styles.profile_section_actions}>
                    <div
                      className={styles.profile_section_accordion_icon}
                    ></div>
                  </div>
                </div>
                <div className={styles.profile_body}>
                  <div className="pu_input_wrapper_list">
                    <div className="pu_input_wrapper">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="pu_input"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        onBlur={(e) => updateProfileName(e)}
                      />
                    </div>
                    <div className="pu_input_wrapper">
                      <label>Profile Image</label>
                      <InputImageUploader
                        url={profileImage ? profileImage : ""}
                        templateId={props.editorData._id}
                      />
                    </div>
                  </div>
                  <div className="pu_input_wrapper">
                    <label>Tag Line</label>
                    <textarea
                      rows="5"
                      className="pu_input"
                      value={profileTagline}
                      onChange={(e) => setProfileTagline(e.target.value)}
                      onBlur={(e) => updateProfileTagline(e)}
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : null}
            {sectionList.length ? (
              <DragDropContext onDragEnd={sectionDragHandle}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {sectionList.map((section, index) => (
                        <Draggable
                          key={section._id}
                          draggableId={section._id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <PageSection
                                bgColor={bgcolor}
                                secondaryColor={secondaryColor}
                                data={section}
                                dragprops={provided}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <ContentLoader
            viewBox="0 0 800 650"
            backgroundColor={"#FFFFFF"}
            foregroundColor={"#f8fafd"}
          >
            <rect x="0" y="0" rx="8" ry="8" width="550" height="60" />
            <rect x="570" y="0" rx="8" ry="8" width="230" height="60" />
            <rect x="0" y="90" rx="8" ry="8" width="800" height="200" />
            <rect x="0" y="310" rx="8" ry="8" width="800" height="100" />
            <rect x="0" y="430" rx="8" ry="8" width="800" height="100" />
            <rect x="0" y="550" rx="8" ry="8" width="800" height="100" />
          </ContentLoader>
          <br />
          <br />
        </>
      )}

      <Popup
        heading="Add New Element"
        subHeading="Select And Add Element to the Page"
        maxWidth="630px"
        show={addElementPopup}
        onClose={elementPopupCloseHandler}
      >
        <div className={styles.element_list}>
          {isAdmin ? (
            <>
              {elementList
                .filter((item) => item.status === 1)
                .map((el) => {
                  const findSectionData = sectionList.find((list) =>
                    el.type.includes(list.sectionData?.type)
                  );
                  const sectionData = findSectionData?.sectionData || {};
                  return (
                    <div
                      key={el.id}
                      className={styles.element_item}
                      onClick={() => addElement(el)}
                    >
                      <span>{svg[el.icon]}</span>
                      <p>{el.title}</p>
                    </div>
                  );
                })}
            </>
          ) : (
            <>
              {elementList
                .filter((item) => item.status === 1)
                .map((el) => {
                  const findSectionData = sectionList.find((list) =>
                    el.type.includes(list.sectionData?.type)
                  );
                  const sectionData = findSectionData?.sectionData || {};
                  const isUnlocked = featuresIds?.includes(el.id);

                  return (
                    <button
                      disabled={!isUnlocked}
                      key={el.id}
                      className={`${styles.element_item} ${
                        !isUnlocked ? styles.overlay : ""
                      }`}
                      onClick={isUnlocked ? () => addElement(el) : () => {}}
                    >
                      <span>{svg[el.icon]}</span>
                      <p style={{ color: `${isUnlocked ? "" : "#888"}` }}>
                        {el.title}
                      </p>
                    </button>
                  );
                })}
            </>
          )}
        </div>
      </Popup>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    ...state.editor,
  };
};

export default compose(connect(mapStateToProps, null))(pageEditor);
