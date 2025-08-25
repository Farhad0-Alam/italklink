import { useState } from "react";
import styles from "./ContactForm.module.css";
import { makeStyles } from "../card-preview";
import { Edit2 } from "lucide-react";

const ContactForm = ({
  styles: CfStyles,
  content,
  Icon,
  element,
  onOpenModal,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    // For this example, we'll just log it to the console
    setSubmitStatus("Form submitted successfully!");
    // Reset form fields
    setName("");
    setEmail("");
    setMessage("");
  };

  const dynamicStyles = makeStyles(element);

  const color = element?.labelColor;

  return (
    <div
      className={`${styles.formContainer} ${CfStyles.editableSection}`}
      style={{ ...dynamicStyles }}
    >
      <Edit2
        className={CfStyles.editIcon}
        size={18}
        style={{
          background: "#fff",
          padding: "1px",
          borderRadius: "50%",
          top: "8%",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal(element);
        }}
      />
      <h2 style={{ textAlign: "center" }}>
        {element?.content || "Contact Form"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label style={{ color }} htmlFor="name" className={styles.label}>
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label style={{ color }} htmlFor="email" className={styles.label}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label style={{ color }} htmlFor="message" className={styles.label}>
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Send
        </button>
      </form>
      {submitStatus && <p className={styles.successMessage}>{submitStatus}</p>}
    </div>
  );
};

export default ContactForm;
