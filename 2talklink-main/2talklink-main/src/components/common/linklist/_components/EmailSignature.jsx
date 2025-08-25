import { useEffect, useState, useRef } from "react";
import styles from "./emailSignature.module.css";
import generateSignature from "../../../email-signature/signature";
import { common } from "../../../../helper/Common";
import { AlertMsg } from "../../../../helper/helper";
import { HuePicker, SketchPicker, TwitterPicker } from "react-color";

export default function EmailSignature({ onClose, currentTemplate }) {
  const [signature, setSignature] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [expired, setExpired] = useState();
  const [show404, setShow404] = useState();
  const [tempData, setTempData] = useState();
  const [iconColor, setIconColor] = useState("#000");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    common.getAPI(
      {
        method: "POST",
        url: "preview/getTemplatePage",
        data: {
          link_slug: currentTemplate?.slug,
          page_slug: "home",
        },
      },
      (resp) => {
        if (resp.status === "success") {
          if (resp.data == 0) {
            if (store.userData.user_id) {
              if (resp.userid == store.userData.user_id) {
                setExpired(true);
              } else {
                setShow404(true);
              }
            } else {
              setShow404(true);
            }
          }
          if (resp.data) {
            setTempData(resp.data);
          }
        }
      },
      (resp) => {
        if (resp.status === "error") {
          setShow404(true);
        }
      }
    );
  }, []);

  const template = tempData?.template || {};
  const sections = tempData?.sections || [];
  const data = {};

  data.name = template?.profile?.name || "";
  data.image = `${process.env.s3URL}${template?.profile?.image}` || "";
  data.tagLine = template?.profile?.tagline || "";

  template?.SocialIconData?.forEach((icon) => {
    data[icon?.name?.toLowerCase()] = icon?.value || "";
  });

  sections?.forEach((section) => {
    const sectionData = section?.sectionData || {};
    const type = sectionData?.type;
    const title = type === "location" ? sectionData?.url : sectionData?.title;
    data[type] = data[type] || title;
    if (type === "location") {
      data.locationUrl = sectionData?.fullURL;
    }
    if (type === "phone") {
      data.phoneLink = sectionData?.fullURL;
      data.phone = sectionData?.url;
    }
  });
  // console.log({ sections });

  const handleGenerateSignature = () => {
    data.cardUrl = `${process.env.APP_URL}${currentTemplate?.slug}`;
    data.color = iconColor;
    const signature = generateSignature(data);
    const previewSignature = generateSignature(data, true);
    setSignature(signature);
    setPreviewSignature(previewSignature);
  };

  const handleCopy = () => {
    const blob = new Blob([signature], { type: "text/html" });
    const clipboardItem = new ClipboardItem({ "text/html": blob });

    navigator.clipboard
      .write([clipboardItem])
      .then(() => {
        AlertMsg("success", "Copying", "Copy Success");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => AlertMsg("error", "Something went wrong!"));
  };

  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className="pu_input_wrapper" style={{ marginBottom: "10px" }}>
        <label>Icon Color</label>
        <div className="pu_color_picker_wrapper" ref={pickerRef}>
          {/* Color Picker Toggle */}
          <div
            className="pu_color_picker_toggle"
            onClick={() => setIsPickerOpen((prev) => !prev)}
          >
            <span className="pu_color_name">{iconColor}</span>
            <span
              className="pu_color_preview"
              style={{ backgroundColor: iconColor }}
            ></span>
          </div>

          {/* Color Picker Dropdown */}
          {isPickerOpen && (
            <div className="pu_color_picker_dropdown">
              <SketchPicker
                color={iconColor}
                onChange={(color) => setIconColor(color.hex)}
              />
              <HuePicker
                color={iconColor}
                onChange={(color) => setIconColor(color.hex)}
                width={276}
              />
              <TwitterPicker
                color={iconColor}
                onChange={(color) => setIconColor(color.hex)}
                width={276}
              />
            </div>
          )}
        </div>
      </div>

      <button className={`pu_btn`} onClick={handleGenerateSignature}>
        Generate Signature
      </button>

      {previewSignature && signature && (
        <div className={styles.previewContainer}>
          <button
            onClick={handleCopy}
            className={`${styles.button} pu_btn`}
            aria-label={isCopied ? "Copied" : "Copy"}
          >
            <span className={styles.text}>{isCopied ? "Copied!" : "Copy"}</span>
            <svg
              className={styles.icon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isCopied ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              )}
            </svg>
          </button>
          <div
            className={styles.signaturePreview}
            dangerouslySetInnerHTML={{ __html: previewSignature }}
          />
        </div>
      )}
    </div>
  );
}
