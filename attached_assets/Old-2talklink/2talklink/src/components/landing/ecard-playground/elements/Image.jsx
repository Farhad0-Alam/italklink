import { Edit2, Phone } from "lucide-react";
import { makeStyles } from "../card-preview";
import Image from "next/image";

export default function ElementImage({
  styles,
  content,
  Icon,
  element,
  onOpenModal,
}) {
  return (
    <>
      <div
        style={makeStyles(element, { padding: "5px" })}
        className={`${styles.contactItem} ${styles.editableSection}`}
      >
        {content ? (
          <Image
            src={content}
            height={300}
            width={300}
            alt={content}
            quality={100}
            priority
            unoptimized
            style={{ maxHeight: "500px", objectFit: "cover" }}
          />
        ) : (
          <>
            <div
              style={{
                width: `100%`,
                height: ` 100px`,
                backgroundColor: `#ddd`,
                borderRadius: `10px`,
                boxShadow: `0 4px 8px rgba(162, 161, 161, 0.2), 0 6px 20px rgba(178, 169, 169, 0.19)`,
              }}
            ></div>
          </>
        )}

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
