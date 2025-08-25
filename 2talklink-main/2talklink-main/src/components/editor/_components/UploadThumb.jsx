import React, { useState, useRef } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import Popup from "../../common/popup/Popup";
import { AlertMsg } from "../../../helper/helper";

const ImageUploader = ({ onThumbUpload }) => {
  const [imageURL, setImageURL] = useState("");
  const [cropperInstance, setCropperInstance] = useState(null);
  const [uploadPopup, setUploadPopup] = useState(false);
  const cropperRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setUploadPopup(true);
      setTimeout(() => {
        const cropper = new Cropper(cropperRef.current, {
          //   aspectRatio: 1,
          viewMode: 1,
        });
        setCropperInstance(cropper);
      }, 100);
    }
  };

  const handleUpload = () => {
    if (cropperInstance) {
      cropperInstance.getCroppedCanvas().toBlob((blob) => {
        onThumbUpload(
          blob,
          () => {
            setUploadPopup(false);
            cropperInstance.destroy();
            setImageURL("");
          },
          () => {
            AlertMsg("error", "Oops!", "There was an problem!");
          }
        );
      });
    }
  };

  const closePopup = () => {
    setUploadPopup(false);
    if (cropperInstance) {
      cropperInstance.destroy();
    }
  };

  return (
    <div>
      {/* Hidden File Input */}
      <input
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="image_upload_input"
      />
      <div className="text-center">
        <label
          htmlFor="image_upload_input"
          style={{ cursor: "pointer" }}
          className="pu_btn"
        >
          Upload Thumb
        </label>
      </div>

      {/* Cropper Popup */}
      <Popup
        show={uploadPopup}
        heading="Upload and Crop Image"
        onClose={closePopup}
      >
        <div>
          <img
            ref={cropperRef}
            src={imageURL}
            alt="To Crop"
            style={{ width: "100%" }}
          />
        </div>
        <br />
        <div className="text-center">
          <button
            onClick={handleUpload}
            style={{ cursor: "pointer" }}
            className="pu_btn"
          >
            Confirm Upload
          </button>
        </div>
      </Popup>
    </div>
  );
};

export default ImageUploader;
