import React, { useState } from "react";
import styles from "./FAQ.module.css";

const faqData = [
  {
    question: "What is a digital business card used for?",
    answer:
      "It’s used to share your contact details (online) with a single link, making networking seamless.",
  },
  {
    question: "How do you keep business cards digitally?",
    answer: "They are stored online and can be accessed via a link or QR code.",
  },
  {
    question: "Can I edit the card myself?",
    answer:
      "Yes, you can edit and update everything, or you can contact us for assistance.",
  },
  {
    question: "Are digital business cards secure?",
    answer:
      "Yes, they are designed with security in mind to protect your data.",
  },
  {
    question: "Still Have Questions?",
    answer:
      "Talk to us about your requirements and we'll get it to you as soon as possible!",
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}>
      <button className={styles.question} onClick={onClick}>
        <span className={styles.questionText}>{question}</span>
        <span className={styles.icon}></span>
      </button>
      <div className={styles.answer}>
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSectionMain}>
      <div className="pu_container">
        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            {faqData.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
