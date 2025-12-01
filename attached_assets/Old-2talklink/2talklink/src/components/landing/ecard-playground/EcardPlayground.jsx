import { useState } from "react";
import ElementSidebar from "./element-sidebar";
import CardPreview from "./card-preview";
import CustomizeModal from "./customize-modal";
import ScoreDisplay from "./score-display";
import styles from "./page.module.css";
import HowToPlay from "./HowToPlay";
import { elements as MainElements } from "./element-sidebar";

export default function EcardPlayground() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [elements, setElements] = useState([]);
  const [score, setScore] = useState(0);
  const [metaData, setMetaData] = useState({
    name: {
      content: "Name Here",
      bgc: "",
      border: "",
      borderRadius: "",
      color: "#008080",
      margin: "0 0 5px 0",
      padding: "0 30px",
      fontSize: "24px",
    },
    tagLine: {
      content: "Tag Line Here",
      color: "#666",
      bgc: "",
      margin: "",
      border: "",
      borderRadius: "",
      padding: "",
    },
    image: {
      content: "https://cdn-icons-png.flaticon.com/512/6858/6858504.png",
      color: "#666",
      bgc: "",
      margin: "",
      border: "4px solid white",
      borderRadius: "50%",
      shadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "",
    },
  });

  const calculateScore = (currentElements) => {
    const scoreIndex = currentElements.filter(
      (obj, index, self) =>
        index === self.findIndex((item) => item.type === obj.type)
    ).length;
    const targetedPerScore = Number(
      Number(100 / MainElements?.length).toFixed(2)
    );
    const finalScore = Math.floor(targetedPerScore * scoreIndex);
    setScore(finalScore);
  };

  const addElement = (element) => {
    const newState = [...elements, element];
    setElements(newState);
    calculateScore(newState);
  };

  const deleteElement = (elementId) => {
    const filteredElements = elements.filter((el) => el.id !== elementId);
    setElements(filteredElements);

    calculateScore(filteredElements);
  };

  const editElement = (elementId, data) => {
    const updatedElements = elements.map((el) => {
      if (el.id === elementId) {
        return { ...el, ...data };
      }
      return el;
    });
    setElements(updatedElements);
  };

  const handleOpenModal = (editData) => {
    setEditData(editData);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditData(null);
    setIsModalOpen(false);
  };

  const editMetaData = (data) => {
    const updatedState = { ...metaData, ...data };
    setMetaData(updatedState);
  };

  const [editData, setEditData] = useState(null);

  return (
    <div className={styles.container} id="play-ground">
      <div className={styles.fcard}>
        <HowToPlay />
        <h3 className={styles.title}>
          2TalkLink <span className={styles.gradient}>Playground</span>
        </h3>
        <div className={styles.textContent}>
          <h4
            className={styles.subtitle}
            style={{ textTransform: "capitalize" }}
          >
            You can create Your Perfect Digital Business Card in Seconds!
          </h4>
          <p style={{ color: "#fff" }}>
            Try out 2TalkLink’s eCard Playground and discover how easy it is to
            create your own digital business card with just a few clicks.
            Experiment with different elements and see how simple it is to
            design your perfect card!
          </p>
        </div>
      </div>
      <div className={styles.content}>
        <ElementSidebar onAddElement={addElement} />
        <CardPreview
          metaData={metaData}
          onMetaData={(data) => setMetaData((prev) => ({ ...prev, ...data }))}
          elements={elements}
          onEditElement={editElement}
          onDeleteElement={deleteElement}
          onOpenModal={handleOpenModal}
          onElementsChanges={setElements}
        />
      </div>
      <ScoreDisplay score={score} elements={elements} />
      <CustomizeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editData}
        onEditMetaData={editMetaData}
        onEditElement={editElement}
        onDeleteElement={deleteElement}
      />
    </div>
  );
}
