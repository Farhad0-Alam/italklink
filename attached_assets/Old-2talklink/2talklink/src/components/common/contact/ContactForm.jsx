import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from "./contact-form.module.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const floatingAnimation = {
  y: ["-10%", "10%"],
  transition: {
    y: {
      duration: 2,
      yoyo: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.API_URL}email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState), // Send the form state as JSON
      });

      const result = await response.json();

      if (response.ok) {
        // console.log("Email sent successfully");
        setFormState({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(result.message || "Something went wrong!");
      }
    } catch (err) {
      setError("Failed to send the email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.contactSection}>
      <motion.div
        className={styles.floatingShape + " " + styles.shape1}
        animate={floatingAnimation}
      />
      <motion.div
        className={styles.floatingShape + " " + styles.shape2}
        animate={floatingAnimation}
      />
      <motion.div
        className={styles.floatingShape + " " + styles.shape3}
        animate={floatingAnimation}
      />
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 className={styles.title} variants={itemVariants}>
          Let's Connect
        </motion.h2>
        <motion.p className={styles.subtitle} variants={itemVariants}>
          Have a brilliant idea or a challenging project? We're all ears! Drop
          us a line and let's create something extraordinary together.
        </motion.p>
        <motion.form
          className={styles.formContainer}
          variants={itemVariants}
          onSubmit={handleSubmit}
        >
          <div className={styles.inputGroup}>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder=" "
            />
            <label htmlFor="name" className={styles.label}>
              Your Name
            </label>
          </div>
          <div className={styles.inputGroup}>
            <input
              type="email"
              id="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder=" "
            />
            <label htmlFor="email" className={styles.label}>
              Your Email
            </label>
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formState.subject}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder=" "
            />
            <label htmlFor="subject" className={styles.label}>
              Subject
            </label>
          </div>
          <div className={styles.inputGroup}>
            <textarea
              id="message"
              name="message"
              value={formState.message}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder=" "
            />
            <label htmlFor="message" className={styles.label}>
              Your Message
            </label>
          </div>
          <motion.button
            type="submit"
            className={`${styles.submitButton} pu_btn`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Message"}
          </motion.button>
        </motion.form>
        {error && (
          <p
            style={{
              background: "#f44336", // Red background for error
              color: "#fff", // White text color
              padding: "15px", // Padding for better spacing
              borderRadius: "8px", // Rounded corners
              fontSize: "16px", // Readable font size
              fontWeight: "bold", // Emphasize the text
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for better contrast
              marginBottom: "20px", // Space below the alert
              textAlign: "center", // Center text
              animation: "fadeIn 0.5s ease-out", // Fade-in effect
            }}
          >
            {error}
          </p>
        )}
      </motion.div>
    </section>
  );
}
