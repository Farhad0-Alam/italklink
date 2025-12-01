import { useEffect, useState } from "react";
import styles from "../_styles/CardGrid.module.css";
import { common } from "../../../../src/helper/Common";
const CARD_TEMPLATES = [
  { id: 1, image: "https://picsum.photos/600/400", name: "Template 1" },
  { id: 2, image: "https://picsum.photos/600/400", name: "Template 2" },
  { id: 3, image: "https://picsum.photos/600/400", name: "Template 3" },
  { id: 4, image: "https://picsum.photos/600/400", name: "Template 4" },
  { id: 5, image: "https://picsum.photos/600/400", name: "Template 5" },
  { id: 6, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 7, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 8, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 9, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 10, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 11, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 12, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 13, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 14, image: "https://picsum.photos/600/400", name: "Template 6" },
  { id: 15, image: "https://picsum.photos/600/400", name: "Template 6" },
];

export default function CardGrid({ selectedModels, onSelectionChange }) {
  const [selectAll, setSelectAll] = useState(false);
  const [CARD_TEMPLATES, setCARD_TEMPLATES] = useState([]);
  const [noData, setNoData] = useState(false);
  const fetchTemplate = async () => {
    common.getAPI(
      {
        method: "POST",
        url: "admin/getAllTemplates",
        data: {},
      },
      (resp) => {
        if (resp.status === "success") {
          setCARD_TEMPLATES(resp.data);
          if (!resp.data.length > 0) {
            setNoData(true);
          } else {
            setNoData(false);
          }
          setTemplateCount(resp.totalTemplates);
        }
      }
    );
  };
  useEffect(() => {
    (async () => {
      await fetchTemplate();
    })();
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      onSelectionChange([]);
      setSelectAll(false);
    } else {
      onSelectionChange(CARD_TEMPLATES.map((template) => template._id));
      setSelectAll(true);
    }
  };
  
  

  const handleCardSelect = (id) => {
    const prevArray = Array.isArray(selectedModels) ? selectedModels : [];
    let updatedState = [];
    if (prevArray.includes(id)) {
      updatedState = prevArray.filter((modelId) => modelId !== id);
    } else {
      updatedState = [...prevArray, id];
    }
    onSelectionChange(updatedState);
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
          : `Select all models (${selectedModels.length})`}
      </button>
      <div className={styles.grid}>
        {CARD_TEMPLATES.map((template) => (
          <div
            key={template._id}
            className={`${styles.card} ${
              selectedModels?.includes(template._id) ? styles.selected : ""
            }`}
            onClick={() => handleCardSelect(template._id)}
          >
            <img
              src={template?.thumb?.url || "/blank.png"}
              alt={template?.title}
            />
            <div className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedModels.includes(template._id)}
                onChange={() => handleCardSelect(template._id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <h2 style={{ fontSize: "18px", paddingLeft: "5px" }}>
              {template?.title}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
