import { Edit, Edit2, Phone } from "lucide-react";
import { makeStyles } from "../card-preview";

export default function ElementTextBlock({
  styles,
  content,
  element,
  onOpenModal,
}) {
  const dynamicStyles = makeStyles(element, { padding: "5px" });
  const { fontSize, color } = dynamicStyles || {};
  return (
    <>
      <div
        style={dynamicStyles}
        className={`${styles.contactItem} ${styles.editableSection}`}
      >
        <p style={{ fontSize, color }}>{content}</p>
        <Edit2
          className={styles.editIcon}
          size={18}
          style={{ background: "#fff", padding: "1px", borderRadius: "50%" }}
          onClick={() => onOpenModal(element)}
        />
      </div>
    </>
  );
}
