import { useState, useEffect } from "react";
import styles from "../_styles/FeaturesList.module.css";

const FEATURES = [
  {
    id: 1,
    title: "Heading",
    type: "el_heading",
    status: 1,
  },
  {
    id: 2,
    title: "Paragraph",
    type: "el_paragraph",
    status: 1,
  },
  {
    id: 3,
    title: "Link",
    type: "el_link",
    status: 1,
  },
  {
    id: 4,
    title: "Image",
    type: "el_image",
    status: 1,
    icon: "icon_el_image",
  },
  {
    id: 5,
    title: "Social Icons",
    type: "el_social_icons",
    status: 0,
  },
  {
    id: 6,
    title: "Gallery",
    type: "el_gallery",
    status: 0,
  },
  {
    id: 7,
    title: "QRCode",
    type: "el_qrcode",
    status: 1,
  },
  {
    id: 8,
    title: "Video",
    type: "el_video",
    status: 1,
  },
  {
    id: 9,
    title: "SoundCloud",
    type: "el_audio",
    status: 0,
  },
  {
    id: 900,
    title: "Contact Form",
    type: "el_contact",
    status: 1,
  },
  {
    id: 111,
    title: "Location",
    type: "el_location",
    status: 0,
  },
  {
    id: 2012,
    title: "Accordion",
    type: "el_accordion",
    status: 1,
  },
  {
    id: 2024,
    title: "Image Slider",
    type: "el_image_slider",
    status: 1,
  },
];

export default function FeaturesList({ selected, onFeatureChange }) {
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (selected.length === FEATURES.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selected]);

  const handleSelectAll = () => {
    if (selectAll) {
      onFeatureChange([]);
      setSelectAll(false);
    } else {
      onFeatureChange(FEATURES.map((feature) => feature.id));
      setSelectAll(true);
    }
  };

  const handleToggle = (featureId) => {
    let updatedState = [];
    if (selected.includes(featureId)) {
      updatedState = selected.filter((id) => id !== featureId);
    } else {
      updatedState = [...selected, featureId];
    }
    onFeatureChange(updatedState);
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.selectAllButton}
        onClick={handleSelectAll}
      >
        {selectAll
          ? "Unselect all"
          : `Select all features (${selected.length})`}
      </button>
      <div className={styles.featureGrid}>
        {FEATURES.filter((feature) => feature.status).map((feature) => (
          <label key={feature.id} className={styles.feature}>
            <input
              type="checkbox"
              checked={selected.includes(feature.id)}
              onChange={() => handleToggle(feature.id)}
            />
            <span>{feature.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
