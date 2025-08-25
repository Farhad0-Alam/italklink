import React, { useState } from "react";
import ShareModal from "../../ui/ShareModal";

const ShareButtonV1_2 = (props) => {
  const [showModal, setShowModal] = useState(false);
  const { primaryColor, styles, secondaryColor } = props || {};
  const { template } = props || {};
  const { templateStyle } = template || {};

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={styles.share}
        style={{
          "--primary-color": primaryColor,
          "--secondary-color": secondaryColor,
          cursor: "pointer",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 14 14"
          fill={templateStyle?.tertiary_color || "#fff"}
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginRight: "8px" }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.558 5.10702C11.436 5.88402 9.927 5.64002 9.085 4.59202L5.418 6.30002C5.567 6.79402 5.567 7.31602 5.416 7.81002L9.088 9.52002C9.576 8.91202 10.303 8.54202 11.088 8.54202C11.235 8.54202 11.381 8.55402 11.526 8.57902C12.935 8.82302 13.881 10.168 13.639 11.584C13.397 13 12.058 13.951 10.649 13.707C9.324 13.478 8.423 12.275 8.518 10.957L4.531 9.10002C3.537 9.87602 2.12 9.83502 1.183 8.95802C0.136999 7.97802 0.0799994 6.33102 1.056 5.28102C1.977 4.28802 3.484 4.19402 4.53 5.01102L8.517 3.15402C8.512 3.09202 8.501 3.03002 8.501 2.96702C8.501 2.11102 8.919 1.31002 9.62 0.825022C10.797 0.0100217 12.409 0.307022 13.22 1.49002C14.032 2.67302 13.735 4.29202 12.558 5.10702Z"
            fill={templateStyle?.tertiary_color || "#fff"}
          ></path>
        </svg>{" "}
        <span
          style={{
            fontSize: "16px",
            color: templateStyle?.tertiary_color || "#fff",
          }}
        >
          Share
        </span>
      </button>
      {showModal && (
        <ShareModal {...props} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default ShareButtonV1_2;
