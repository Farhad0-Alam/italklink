import React from "react";
import { Sparkles } from "lucide-react";
import styles from "./CTACard.module.css";
import { useRouter } from "next/router";

const CTACard = ({
  title = "See your top performing links and products",
  description = "Unlock powerful insights with a Pro 30-day free trial. Cancel anytime.",
  buttonText = "Try pro for free",
  buttonLink = "/pricing",
}) => {
  const router = useRouter();
  const onButtonClick = () => {
    router.push(buttonLink);
  };
  return (
    <div className={styles.ctaCard}>
      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>{title}</h2>
        <p className={styles.ctaDescription}>{description}</p>
        <button className={styles.ctaButton} onClick={onButtonClick}>
          <Sparkles className={styles.sparkleIcon} />
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CTACard;
