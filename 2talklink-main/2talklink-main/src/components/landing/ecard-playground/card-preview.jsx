import styles from "./card-preview.module.css";
import { Phone, Mail, Globe, MapPin, Edit2 } from "lucide-react";
import ElementLink from "./elements/ElementLink";
import React from "react";
import ElementButton from "./elements/ElementButton";
import ElementHeading from "./elements/Heading";
import ElementTextBlock from "./elements/TextBlock";
import ElementImage from "./elements/Image";
import Image from "next/image";
import ContactForm from "./elements/ContactForm";
import Accordion from "./elements/Accordion";

export const makeStyles = (
  content = {},
  {
    padding = "unset",
    color = "unset",
    background = "unset",
    margin = "unset",
    border = "unset",
    borderRadius = "unset",
    shadow = "unset",
    fontSize = "unset",
  } = {}
) => ({
  padding: content?.padding || padding,
  color: content?.color || color,
  background: content?.bgc || background,
  margin: content?.margin || margin,
  border: content?.border || border,
  borderRadius: content?.borderRadius || borderRadius,
  fontSize: content?.fontSize || fontSize,
  boxShadow: content?.shadow || shadow,
});

export default function CardPreview({
  elements,
  onOpenModal,
  metaData,
  onElementsChanges,
}) {
  const { tagLine, name, image } = metaData || {};

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div
            style={{ zIndex: "11", ...makeStyles(image) }}
            className={`${styles.profileContainer} ${styles.editableSection}`}
          >
            <Image
              height={200}
              width={200}
              src={image?.content || "/avatar"}
              alt="Profile"
              unoptimized={true}
              className={styles.profileImage}
            />
            <Edit2
              onClick={() =>
                onOpenModal({
                  ...metaData.image,
                  isMetaData: true,
                  type: "image",
                })
              }
              className={`${styles.editIcon} ${styles.profileEditIcon}`}
              size={25}
            />
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.nameSection}>
            <div className={styles.editableSection}>
              <h1 style={makeStyles(name)}>
                {metaData?.name?.content || "Your name"}
              </h1>
              <Edit2
                className={styles.editIcon}
                size={16}
                onClick={() =>
                  onOpenModal({
                    ...metaData.name,
                    isMetaData: true,
                    type: "name",
                  })
                }
              />
            </div>
            <div className={styles.editableSection}>
              <p
                style={makeStyles(tagLine, {
                  color: "#666",
                  padding: "0 30px 0 0",
                })}
              >
                {metaData?.tagLine?.content || "Test Tag Line"}
              </p>
              <Edit2
                className={styles.editIcon}
                size={16}
                onClick={() =>
                  onOpenModal({
                    ...metaData?.tagLine,
                    isMetaData: true,
                    type: "tagLine",
                  })
                }
              />
            </div>
          </div>

          <div
            className={styles.contactInfo}
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            {elements?.length
              ? elements?.map((element) => (
                  <React.Fragment key={element.id}>
                    {element.type === "heading" && (
                      <ElementHeading
                        onOpenModal={onOpenModal}
                        content={element.content}
                        styles={styles}
                        element={element}
                        Icon={element.icon}
                      />
                    )}
                    {element.type === "image" && (
                      <ElementImage
                        onOpenModal={onOpenModal}
                        content={element.content}
                        styles={styles}
                        element={element}
                        Icon={element.icon}
                      />
                    )}
                    {element.type === "text" && (
                      <ElementTextBlock
                        onOpenModal={onOpenModal}
                        content={element.content}
                        styles={styles}
                        element={element}
                        Icon={element.icon}
                      />
                    )}
                    {element.type === "link" && (
                      <ElementLink
                        onOpenModal={onOpenModal}
                        content={element.content}
                        styles={styles}
                        element={element}
                        Icon={element.icon}
                      />
                    )}
                    {element.type === "button" && (
                      <ElementButton
                        onOpenModal={onOpenModal}
                        content={element.content}
                        styles={styles}
                        element={element}
                        Icon={element.icon}
                      />
                    )}
                    {element.type === "form" && (
                      <ContactForm
                        onOpenModal={onOpenModal}
                        content={element.content}
                        styles={styles}
                        element={element}
                        Icon={element.icon}
                      />
                    )}
                    {element.type === "accordion" && (
                      <Accordion
                        onOpenModal={onOpenModal}
                        content={element.content}
                        styles={styles}
                        element={element}
                        Icon={element.icon}
                      />
                    )}
                  </React.Fragment>
                ))
              : null}
          </div>

          {/* <div className={styles.socialSection}>
            <h2>Connect with me</h2>
            <div className={styles.socialIcons}>
              <a
                href="#"
                className={`${styles.socialIcon} ${styles.pinterest}`}
              >
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Pinterest"
                />
              </a>
              <a href="#" className={`${styles.socialIcon} ${styles.whatsapp}`}>
                <img src="/placeholder.svg?height=24&width=24" alt="WhatsApp" />
              </a>
              <a href="#" className={`${styles.socialIcon} ${styles.email}`}>
                <img src="/placeholder.svg?height=24&width=24" alt="Email" />
              </a>
              <a href="#" className={`${styles.socialIcon} ${styles.linkedin}`}>
                <img src="/placeholder.svg?height=24&width=24" alt="LinkedIn" />
              </a>
              <a
                href="#"
                className={`${styles.socialIcon} ${styles.instagram}`}
              >
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Instagram"
                />
              </a>
              <a href="#" className={`${styles.socialIcon} ${styles.twitter}`}>
                <img src="/placeholder.svg?height=24&width=24" alt="Twitter" />
              </a>
              <a href="#" className={`${styles.socialIcon} ${styles.facebook}`}>
                <img src="/placeholder.svg?height=24&width=24" alt="Facebook" />
              </a>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
