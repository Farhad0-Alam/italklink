import axios from "axios"; // axios ইমপোর্ট করতে হবে
import React, { useState } from "react";
import { extractGradientColor } from "../../../../../utils/extractGradientColor";
import styles from "./Heading.module.css"; // Import the CSS module for styling
import linkStyles from "./Messenger.module.css"; // Import the CSS module for styling
import Button from "./button";

const Contact = (props) => {
  const { templateStyle } = props || {};
  const { bgcolor } = templateStyle || {};


 

  
  const {
    item: { sectionData },
  } = props || {};
  const { email: userEmail, title } = sectionData || {};

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\d{10,14}$/;
    return re.test(phone);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess(null);
      setLoading(false);
      return;
    }

    setErrors({});
    try {
      const response = await axios.post("/api/contact-us", {
        ...formData,
        userEmail,
      });
      if (response.data.status === "success") {
        setSuccess("Your message has been sent successfully!");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        setSuccess(null);
        setErrors({ api: response.data.message });
      }
    } catch (error) {
      setSuccess(null);
      setErrors({ api: "There was an error sending your message." });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Color and background determination logic
  let color = props.primaryColor || "#111";
  let background = props.secondaryColor || "#fff";
  const secondaryColor = props.secondaryColor;
  const defaultGradient = props.defaultGradient;
  const primaryColor = props.primaryColor;

  switch (props.htmlId) {
    case "1":
      color = extractGradientColor(defaultGradient);
      background = defaultGradient;
      break;
    case "2":
    case "5":
    case "10":
    case "13":
    case "14":
    case "16":
    case "17":
    case "19":
      color = primaryColor;
      background = secondaryColor;
      break;
    case "3":
    case "4":
    case "6":
    case "7":
    case "8":
    case "9":
    case "11":
    case "12":
    case "15":
    case "20":
      color = secondaryColor;
      background = primaryColor;
      break;
    case "18":
      color = defaultGradient;
      background = defaultGradient;
      break;
    default:
      break;
  }

  return (
    <div
      className={
        styles.contactUsForm +
        " contact-us-form" +
        " " +
        styles["theme_" + props.htmlId]
      }
      style={{ bgcolor, "--primary_color": color }}
    >
      <h2 className={styles.heading} style={{ color }}>
        {title}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder={"Full Name"}
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={errors.fullName ? styles.inputError : ""}
        />
        {errors.fullName && (
          <span className={styles.error}>{errors.fullName}</span>
        )}

        <input
          placeholder="Email"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? styles.inputError : ""}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}

        <input
          placeholder="Phone"
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? styles.inputError : ""}
        />
        {errors.phone && <span className={styles.error}>{errors.phone}</span>}

        <textarea
          id="message"
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          className={errors.message ? styles.inputError : ""}
        />
        {errors.message && (
          <span className={styles.error}>{errors.message}</span>
        )}

        {/* <button
                    type="submit"
                    style={{ background, color }}
                    disabled={loading}>
                    Send Message
                </button> */}
        <Button
          item={props.item}
          tempId={props.tempId}
          pageId={props.pageId}
          isAdmin={props.isAdmin}
          linkSlug={props.linkSlug}
          htmlId={props.htmlId}
          textFont={props.textFont}
          primaryColor={props.primaryColor}
          secondaryColor={props.secondaryColor}
          defaultGradient={props.defaultGradient}
          isEditorPreview={props.isEditorPreview}
          tertiaryColor={templateStyle?.tertiary_color || "#fff"}
          disabled={loading}
          label={"Send Message"}
        />

        {success && <div className={styles.successMessage}>{success}</div>}
        {errors.api && <div className={styles.errorMessage}>{errors.api}</div>}
      </form>
      <span
        className={linkStyles.link_bg}
        style={{
          backgroundImage: props.defaultGradient,
        }}
      ></span>
    </div>
  );
};

export default Contact;
