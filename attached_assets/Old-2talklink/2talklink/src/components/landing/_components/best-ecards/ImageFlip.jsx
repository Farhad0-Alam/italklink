import React, { useState, useEffect } from "react";
import styles from "./ImageFlip.module.css";
import { Link } from "lucide-react";
import Image from "next/image";

const ImageFlip = ({
  frontImage,
  username,
  link,
  background,
  customStyles,
  swiperRef,
}) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlipStart = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.autoplay.stop();
    }
    setFlipped(true);
  };

  const handleFlipEnd = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.autoplay.start();
    }
    setFlipped(false);
  };

  const [newStyles, setNewStyles] = useState(customStyles);

  const { width, ...others } = newStyles || null;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setNewStyles((prev) => ({
          ...prev,
          width: "300px",
          borderRadius: "30px",
        }));
      }
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${styles.card} ${flipped ? styles.flipped : ""}`}
      style={{ ...newStyles, cursor: "pointer" }}
      onMouseEnter={handleFlipStart}
      onMouseLeave={handleFlipEnd}
    >
      <div className={styles.cardInner}>
        {/* Front Side */}
        <div className={`${styles.cardFront} own-slider-custom`} style={others || {}}>
          <Image
            width={400}
            height={460}
            src={frontImage}
            alt="Front"
            priority={true}
            className={styles.image}
          />
        </div>

        {/* Back Side */}
        <div
          className={styles.cardBack}
          style={{ background: background, ...others }}
        >
          <div className={styles.backContent}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <Link />{" "}
              <span
                style={{ fontSize: "1.4rem", letterSpacing: "0.1rem" }}
              >{`/${username || "talklink"}`}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageFlip;
