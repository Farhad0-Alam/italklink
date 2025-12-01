import { Edit, Edit2, Phone } from "lucide-react";
import { makeStyles } from "../card-preview";

export default function ElementButton({
  styles,
  content,
  Icon,
  element,
  onOpenModal,
}) {
  const dynamicStyles = makeStyles(element);
  const { fontSize, color } = dynamicStyles || {};
  return (
    <>
      <div
        style={dynamicStyles}
        className={`${styles.contactItem} ${styles.editableSection}`}
      >
        <span style={{ color, fontSize }}>{content}</span>
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
