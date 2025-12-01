import React, { useEffect, useRef, useState } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import styles from "../../../../../styles/elements/ImageSlider.module.css";
import { useDispatch } from "react-redux";
import axios from "axios";
import svg from "../../../../helper/svg";
import Cookies from "js-cookie";
import { AlertMsg } from "../../../../helper/helper";
import { isEqual } from "lodash";

function ImageSlider(props) {
  const { data } = props || {};
  const { sliderImages } = data || {};

  const dispatch = useDispatch();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const tractImages = useRef(images);

  useEffect(() => {
    let flag = false;
    if (sliderImages?.length) {
      if (!flag) {
        const newState = Array.from(
          new Map(sliderImages.map((image) => [image?.image, image])).values()
        );
        setImages([...newState]);
        tractImages.current = [...newState];
      }
    }
    return () => {
      flag = true;
    };
  }, [sliderImages]);

  // Handle image file uploads
  const handleUpload = (e) => {
    const newImages = Array.from(e.target.files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
    }));

    // Update the images state in the UI (optional, if you need to display preview)
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  // Delete an image
  const handleDelete = async (imageObjet) => {
    if (imageObjet?.image) {
      const deletedImage = images.map((image) => {
        if (image.image === imageObjet.image) {
          return { ...image, remove: true };
        }
        return image;
      });

      setImages(deletedImage);
      return;
    }
    setImages((prevImages) =>
      prevImages.filter((image) => image.id !== imageObjet.id)
    );
  };

  // Sortable Item Component

  const SortableItem = SortableElement(({ image, index }) => (
    <div className={styles.imageItem} style={{ cursor: "move" }}>
      <img
        src={image.url || image.image}
        alt={`Uploaded ${image.id || index}`}
        className={styles.image}
        style={{ filter: image.remove ? "blur(4px)" : "unset" }}
      />
      {image.url && <button className={styles.badge}>New</button>}
      <button
        className={styles.deleteButton}
        onClick={() => handleDelete(image)}
      >
        ✕
      </button>
    </div>
  ));

  // Sortable List Container
  const SortableList = SortableContainer(({ images }) => (
    <div className={styles.imagePreview} style={{ cursor: "move" }}>
      {images.map((image, index) => (
        <SortableItem key={image.id} index={index} image={image} />
      ))}
    </div>
  ));
  const handleSortEnd = async ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return; // No changes if indices are the same

    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(oldIndex, 1);
    updatedImages.splice(newIndex, 0, movedImage);
    setImages(updatedImages);
  };

  // Handle saving images to the server (using axios)
  const handleSaveToServer = async () => {
    setUploading(true);
    const files = images?.filter((image) => image?.url);

    try {
      const uploadRunning = images?.some((image) => image?.url);
      const deleteRunning = images?.some((image) => image?.remove);
      const isDragging = isEqual(tractImages.current, images);

      let updatedImagesForSorting = [...images];
      if (uploadRunning) {
        // Create a new FormData object
        const formData = new FormData();

        // Append the image files to the formData
        files.forEach((image) => {
          formData.append("file", image.file); // 'file' is the key expected by the backend
        });

        // Append additional fields to FormData (e.g., section_id)
        formData.append("section_id", props?.data?._id);

        // Send the POST request with the formData
        const response = await axios.post(
          `${process.env.API_URL}upload/uploadMultipleImages`,
          formData, // Send the formData directly
          {
            headers: {
              "Content-Type": "multipart/form-data", // Make sure the server expects multipart form data
              authorization: Cookies.get("accessToken"), // Include the authorization token if required
            },
          }
        );

        // Handle success
        if (response.data.status === "success") {
          const fileImageIndexes = images
            .map((image, index) => (image.url ? index : null))
            .filter((index) => index !== null);

          const responseImages = response.data.images;
          const updatedImages = [...images];
          fileImageIndexes.forEach((position, index) => {
            updatedImages[position] = responseImages[index];
          });
          setImages([...updatedImages]);
          updatedImagesForSorting = [...updatedImages];
          const data = { ...props.data, sliderImages: updatedImages };
          dispatch({
            type: "ADD_AND_REMOVE_IMAGE_FOR_IMAGE_SLIDER",
            payload: data,
          });
          AlertMsg(
            "success",
            "Upload Successful",
            "Your images have been uploaded successfully."
          );
        } else {
          AlertMsg("error", "Oops!", "Failed to upload images.");
        }
      }
      if (deleteRunning) {
        await removeImage();
      }
      if (!isDragging) {
        await draggingSort(updatedImagesForSorting);
      }
    } catch (error) {
      AlertMsg(
        "error",
        "Oops!",
        "An error occurred while uploading the images."
      );
    } finally {
      setUploading(false);
    }
  };

  const draggingSort = async (updatedImages) => {
    try {
      const response = await axios.post(
        `${process.env.API_URL}upload/uploadMultipleImages`,
        {
          section_id: props?.data?._id,
          sliderImages: updatedImages,
        },
        {
          headers: {
            authorization: Cookies.get("accessToken") || "",
            "Content-Type": "application/json",
          },
        }
      );
      // Handle API response
      if (response?.data?.status === "success") {
        // Update Redux state or context
        dispatch({
          type: "ADD_AND_REMOVE_IMAGE_FOR_IMAGE_SLIDER",
          payload: { ...props.data, sliderImages: updatedImages },
        });
        setImages(updatedImages);
      } else {
        AlertMsg("error", "Oops!", "Failed to upload images.");
        setImages(tractImages.current);
      }
    } catch (error) {
      AlertMsg(
        "error",
        "Oops!",
        "An unexpected error occurred while reordering images."
      );

      setImages(tractImages.current);
    }
  };

  const removeImage = async () => {
    const removedImages = images
      .filter((image) => image.remove)
      .map((image) => image.image);

    try {
      await Promise.all([
        axios.delete(`${process.env.API_URL}upload/deleteImages`, {
          headers: {
            authorization: Cookies.get("accessToken"),
          },
          data: {
            // Use 'data' instead of directly sending the body
            images: removedImages,
          },
        }),
        axios.delete(`${process.env.API_URL}upload/deleteMultipleImages`, {
          headers: {
            authorization: Cookies.get("accessToken"),
          },
          data: {
            // Use 'data' here as well
            section_id: props?.data?._id,
            imageUrls: removedImages,
          },
        }),
      ]);
      const data = {
        ...props.data,
        sliderImages: [...images.filter((image) => !image.remove)],
      };

      dispatch({
        type: "ADD_AND_REMOVE_IMAGE_FOR_IMAGE_SLIDER",
        payload: data,
      });
      setImages([...images.filter((image) => !image.remove)]);
    } catch {
      //
      AlertMsg(
        "error",
        "Oops!",
        "An error occurred while deleting the images."
      );
    }
  };

  const uploadRunning = images?.some((image) => {
    if (image?.url || image.remove) {
      return true;
    }
    return false;
  });
  const isDragging = isEqual(tractImages.current, images);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Image Slider</h2>
      <div className={styles.wrapper} style={{ marginBottom: "10px" }}>
        <div className={styles.uploader} style={{ width: "100%" }}>
          <input
            type="file"
            id={props.data._id}
            accept=".png,.jpg"
            multiple
            onChange={handleUpload}
          />
          <label htmlFor={props.data._id} style={{ width: "100%" }}>
            {svg.icon_upload}
            <span>Upload</span>
          </label>
        </div>
      </div>
      <SortableList images={images} onSortEnd={handleSortEnd} axis="xy" />

      <button className={styles.uploadButton} onClick={handleSaveToServer}>
        {uploading ? "Uploading..." : "Save"}
      </button>
    </div>
  );
}

export default ImageSlider;
