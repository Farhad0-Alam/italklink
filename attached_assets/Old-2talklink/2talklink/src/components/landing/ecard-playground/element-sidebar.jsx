import { ListCollapse } from "lucide-react";
import styles from "./element-sidebar.module.css";
import { Text, Type, PictureInPicture, BoxIcon as Button } from "lucide-react";
import { ReceiptText } from "lucide-react";

export const elements = [
  {
    name: "Heading",
    icon: Type,
    content: "Your Heading Here",
    color: "",
    bgc: "",
    margin: "",
    border: "",
    borderRadius: "",
    padding: "",
    type: "heading",
  },
  {
    type: "text",
    name: "Text Block",
    icon: Text,
    content:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officiis repellendus quae ipsam voluptatem, provident incidunt.",
    color: "",
    bgc: "",
    margin: "",
    border: "",
    borderRadius: "",
    padding: "",
  },
  {
    type: "image",
    name: "Image",
    icon: PictureInPicture,
    content:
      "https://ecardurl.s3.ap-south-1.amazonaws.com/usercontent/673cfe63425df3be886f405f/templates/673d0044cd2be3d2d5ea9b9e/e864cffe-13dc-4fe6-ab1c-012e8e254aa4.png",
    color: "",
    bgc: "",
    margin: "",
    border: "",
    borderRadius: "",
    padding: "",
  },
  {
    type: "button",
    name: "Button",
    icon: Button,
    content: "Your Link Title Goes here",
    color: "#fff",
    bgc: "#42A5F5",
    margin: "",
    border: "",
    borderRadius: "10px",
    padding: "10px",
  },
  {
    name: "Accordion",
    icon: ListCollapse,
    title: "This is your Dropdown",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat amet iusto quaerat iste hic earum nostrum nisi, quas asperiores laboriosam!",
    color: "white",
    bgc: "#9c27b0",
    margin: "",
    border: "",
    borderRadius: "",
    secondaryColor: "#4a148c",
    secondaryBg: "#f3e5f5",
    padding: "15px 20px",
    type: "accordion",
  },
  {
    name: "Contact Form",
    icon: ReceiptText,
    content: "Contact Form",
    color: "",
    bgc: "",
    labelColor: "",
    margin: "",
    border: "1px solid #ccc",
    borderRadius: "",
    padding: "20px",
    type: "form",
  },
];

export default function ElementSidebar({ onAddElement }) {
  const handleAddElement = (data) => {
    onAddElement({ ...data, id: Date.now() });
  };
  return (
    <div className={styles.sidebar}>
      <div>
        <h2 className={styles.title}>Design Elements</h2>
        <div className={styles.elements}>
          {elements.map((element) => (
            <div
              key={element.name}
              className={styles.element}
              onClick={() => handleAddElement(element)}
            >
              <div className={styles.iconWrapper}>
                <element.icon className={styles.icon} />
              </div>
              <span className={styles.elementName}>{element.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
