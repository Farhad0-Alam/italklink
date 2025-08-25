import { Edit2, Phone } from "lucide-react";
import { makeStyles } from "../card-preview";
function parseAndModifySVG(svgString, newAttributes) {
  // Regex patterns for height, width, and fill
  const heightRegex = /height=\{?["']?(\d+)[\w'%]*["']?\}?/;
  const widthRegex = /width=\{?["']?(\d+)[\w'%]*["']?\}?/;
  const fillRegex = /fill=\{?["']?([^"'}]+)["']?\}?/; // Match any valid fill value

  // Replace the attributes if found
  const updatedSVG = svgString
    .replace(heightRegex, `height=${newAttributes.height || "$1"} `)
    .replace(widthRegex, `width=${newAttributes.width || "$1"} `)
    .replace(fillRegex, `fill=${newAttributes.fill || "$1"} `);

  return updatedSVG;
}
export default function ElementLink({ styles, content, element, onOpenModal }) {
  const dynamicStyles = makeStyles(element, { padding: "10px" });
  const { fontSize, color } = dynamicStyles || {};

  return (
    <>
      <div
        style={{ ...dynamicStyles, display: "flex", alignItems: "center" }}
        className={`${styles.contactItem} ${styles.editableSection}`}
      >
        <div
          className={styles.icon}
          style={{ color, fontSize, height: "100%" }}
          dangerouslySetInnerHTML={{
            __html: parseAndModifySVG(element.activeIcon?.icon, {
              height: fontSize,
              width: fontSize,
              fill: color,
            }),
          }}
        ></div>
        <span style={{ color, fontSize }}>{content}</span>
        <Edit2
          className={styles.editIcon}
          size={16}
          style={{ background: "#fff", padding: "3px", borderRadius: "50%" }}
          onClick={() => onOpenModal(element)}
        />
      </div>
    </>
  );
}
