import styles from "./customize-modal.module.css";
import { X } from "lucide-react";
import CustomDropdown from "./IconDrowDown";
import { useState } from "react";

export default function CustomizeModal({
  isOpen,
  onClose,
  editData,
  onEditMetaData,
  onEditElement,
  onDeleteElement,
}) {
  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    if (editData?.isMetaData) {
      const type = editData?.type;
      const updatedState = {};
      updatedState[type] = formValues;
      onEditMetaData(updatedState);
    } else {
      if (editData?.type === "link") {
        formValues["activeIcon"] = activeIcon;
      }
      onEditElement(editData?.id, formValues);
    }

    onClose();
  };

  const currentData = { ...editData };
  const type = currentData?.type;
  const [activeIcon, setActiveIcon] = useState(
    currentData?.activeIcon || { id: "", type: "", icon: "" }
  );

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      style={{ zIndex: 999999 }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Customize Element</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            {type === "accordion" && (
              <>
                <div className={styles.field}>
                  <label htmlFor="link">Title</label>
                  <input
                    name="title"
                    type="text"
                    id="title"
                    defaultValue={currentData?.title}
                    placeholder={"Enter Title..."}
                  />
                </div>
              </>
            )}

            <div className={styles.field}>
              <label htmlFor="text">
                {type === "image" ? "Image url" : "Text Content"}
              </label>
              {type === "accordion" ? (
                <textarea
                  name="content"
                  type="text"
                  id="text"
                  defaultValue={currentData?.content}
                  placeholder={"Enter Content..."}
                />
              ) : (
                <input
                  name="content"
                  type="text"
                  id="text"
                  defaultValue={currentData?.content}
                  placeholder={
                    type === "image" ? "Enter Image url" : "Enter Text..."
                  }
                />
              )}
            </div>
            {type === "link" && (
              <>
                <div className={styles.field}>
                  <label htmlFor="link">Link</label>
                  <input
                    name="link"
                    type="text"
                    id="link"
                    defaultValue={currentData?.content}
                    placeholder={"Enter Href..."}
                  />
                </div>
                <div className={styles.field} style={{ position: "relative" }}>
                  <label htmlFor="link">Icons</label>
                  <CustomDropdown
                    data={currentData}
                    type={""}
                    onActiveIcon={setActiveIcon}
                  />
                </div>
              </>
            )}

            {type !== "image" && (
              <>
                <div className={styles.field}>
                  <label htmlFor="fontSize">Font Size</label>
                  <input
                    name="fontSize"
                    type="text"
                    defaultValue={currentData?.fontSize}
                    id="fontSize"
                    placeholder="18px"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="color">Text Color</label>
                  <input
                    name="color"
                    type="color"
                    id="color"
                    defaultValue={currentData?.color || "#111"}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="background">Background</label>
                  <input
                    name="bgc"
                    type="color"
                    id="background"
                    defaultValue={currentData?.bgc || "#ffffff"}
                  />
                </div>

                {type === "accordion" && (
                  <>
                    {" "}
                    <div className={styles.field}>
                      <label htmlFor="secondaryColor">
                        Secondary Text Color
                      </label>
                      <input
                        name="secondaryColor"
                        type="color"
                        id="secondaryColor"
                        defaultValue={currentData?.secondaryColor || "#111"}
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="secondaryBg">Secondary Background</label>
                      <input
                        name="secondaryBg"
                        type="color"
                        id="secondaryBg"
                        defaultValue={currentData?.secondaryBg || "#111"}
                      />
                    </div>
                  </>
                )}
                {type === "form" && (
                  <>
                    {" "}
                    <div className={styles.field}>
                      <label htmlFor="labelColor">Label Color</label>
                      <input
                        name="labelColor"
                        type="color"
                        id="labelColor"
                        defaultValue={currentData?.labelColor || "#111"}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className={styles.field}>
              <label htmlFor="margin">Margin</label>
              <input
                name="margin"
                type="text"
                id="margin"
                defaultValue={currentData?.margin}
                placeholder="0px 0px 0px 0px"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="padding">Padding</label>
              <input
                name="padding"
                type="text"
                defaultValue={currentData?.padding}
                id="padding"
                placeholder="0px 0px 0px 0px"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="border">Border</label>
              <input
                name="border"
                type="text"
                defaultValue={currentData?.border}
                id="border"
                placeholder="1px solid #ddd"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="borderRadius">Border Radius</label>
              <input
                name="borderRadius"
                type="text"
                defaultValue={currentData?.borderRadius}
                id="borderRadius"
                placeholder="0px"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="shadow">Shadow</label>
              <input
                name="shadow"
                type="text"
                defaultValue={currentData?.shadow}
                id="shadow"
                placeholder="1px 1px #ddd"
              />
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            {!editData?.isMetaData && (
              <button
                type="button"
                onClick={() => {
                  onDeleteElement(editData?.id);
                  onClose();
                }}
                className={`pu_btn`}
              >
                Delete Element
              </button>
            )}
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
