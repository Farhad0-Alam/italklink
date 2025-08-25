import { connect, useSelector } from "react-redux";
import { compose } from "redux";
import styles from "../../../styles/editor/pagePreview.module.css";

import html2canvas from "html2canvas"; // import html2canvas
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { common } from "../../helper/Common";
import { AlertMsg, Loading } from "../../helper/helper";
import svg from "../../helper/svg";
import Popup from "../common/popup/Popup";
import ElementPreview from "./elementPreview";
import UploadThumb from "./_components/UploadThumb";

const PagePreview = (props) => {
  const [tempData, setTempData] = useState("");
  const cData = useSelector((state) => state);
  const [createThumbPopup, setCreateThumbPopup] = useState(false);
  const thumbRef = useRef(null); // useRef to capture the element

  

  const inputRef = useRef(null);

  useEffect(() => {
    if (props) {
      var data = {
        page: props.pageData,
        sections: props.sectionList,
        template: props.editorData,
      };
      setTempData(data);
    }
  }, [props]);

  const thumbPopupCloseHandler = (e) => {
    setCreateThumbPopup(false);
  };

  const setThumbClick = () => {
    Loading(true);
    const el = thumbRef.current; // Access the element using useRef

    // Check if element exists
    if (!el) {
      // console.error("Element not found!");
      Loading(false);
      return;
    }

    // Create a canvas and convert to image
    html2canvas(el)
      .then((canvas) => {
        canvas.toBlob((blob) => {
          if (props.editorData._id) {
            const formData = new FormData();
            formData.append("thumb", blob);
            formData.append("template_id", props.editorData._id);

            common.getAPI(
              {
                method: "POST",
                url: "upload/updateTemplateThumb",
                isFormData: true,
                data: formData,
              },
              (resp) => {
                if (resp.status === "success") {
                  thumbPopupCloseHandler();
                } else {
                  thumbPopupCloseHandler();
                }
                Loading(false); // Stop loader when response is received
              }
            );
          }
        });
      })
      .catch(function (error) {
        Loading(false); // Stop loader if canvas generation fails
        AlertMsg("error","Oops!", "There was an problem!")
      });
  };

  const handleThumbUpload = (blob,success,error)=>{
    if (props.editorData._id) {
      const formData = new FormData();
      formData.append("thumb", blob);
      formData.append("template_id", props.editorData._id);

      common.getAPI(
        {
          method: "POST",
          url: "upload/updateTemplateThumb",
          isFormData: true,
          data: formData,
        },
        (resp) => {
          if (resp.status === "success") {
            success()
          } else {
            error()
          }
        }
      );
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        {cData.userData.role === 1 ? (
          <h3>
            Preview
            <Link
              href={
                "/preview/" +
                props.pageData.templateId +
                "/" +
                props.pageData.slug
              }
            >
              <a target="_blank" rel="noopener noreferrer">
                {svg.icon_open_link}
              </a>
            </Link>
          </h3>
        ) : null}
        <div className={styles.preview_iframe}>
          <img src="/images/phone_mockup.png" alt="" />
          {tempData ? (
            <ElementPreview
              themeStyle={props.themeStyle}
              role={cData.userData.role}
              {...tempData}
              editorPreview={true}
            />
          ) : null}
        </div>
        {cData.userData.role === 1 ? (
          <>
            <br />
            <div className="text-center">
              <button
                className="pu_btn"
                onClick={(e) => setCreateThumbPopup(!createThumbPopup)}
              >
                Set Thumb
              </button>
            </div>
            <br />

            {/* <div> */}
            <UploadThumb inputRef={inputRef} onThumbUpload={handleThumbUpload}/>
            {/* </div> */}
          </>
        ) : null}
      </div>

      <Popup
        heading="Set Thumbnail"
        show={createThumbPopup}
        maxWidth="480px"
        onClose={thumbPopupCloseHandler}
      >
        <div className="pu_set_thumb" id="getTemplateThumbId" ref={thumbRef}>
          {/* Assign ref to the element */}
          {tempData ? (
            <ElementPreview
              themeStyle={props.themeStyle}
              role={cData.userData.role}
              {...tempData}
              editorPreview={true}
            />
          ) : null}
        </div>
        <div className="text-center">
          <button className="pu_btn" onClick={() => setThumbClick()}>
            Set
          </button>
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

export default compose(connect(mapStateToProps, null))(PagePreview);
