import { useState } from "react";
import styles from "./Hero.module.css";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Navigation, Pagination, Autoplay } from "swiper/modules";
import { useRouter } from "next/router";
const cards = [
  {
    "id": 1,
    "src": "/images/html_template_preview/Virtual Business Card with Social Profile Links.jpg",
    "alt": "Virtual Business Card with Social Profile Links"
  },
  {
    "id": 2,
    "src": "/images/html_template_preview/Stylish and Professional Digital Business Card Layout.jpg",
    "alt": "Stylish and Professional Digital Business Card Layout"
  },
  {
    "id": 3,
    "src": "/images/html_template_preview/Smart Virtual Business Card for Startup Founders.jpg",
    "alt": "Smart Virtual Business Card for Startup Founders"
  },
  {
    "id": 6,
    "src": "/images/html_template_preview/Professional Online Contact Card Template with Email & Phone Links.jpg",
    "alt": "Professional Online Contact Card Template with Email & Phone Links"
  },
  {
    "id": 8,
    "src": "/images/html_template_preview/Paperless Business Card Template with One Click Call Options.jpg",
    "alt": "Paperless Business Card Template with One Click Call Options"
  },
  {
    "id": 9,
    "src": "/images/html_template_preview/Online Business Card Template with Social Media Integration.jpg",
    "alt": "Online Business Card Template with Social Media Integration"
  },
  {
    "id": 20,
    "src": "/images/html_template_preview/Custom QR Code Business Card Template with Profile Photo.jpg",
    "alt": "Custom QR Code Business Card Template with Profile Photo"
  },
  {
    "id": 23,
    "src": "/images/html_template_preview/Clickable Digital Profile Card for Personal Websites.jpg",
    "alt": "Clickable Digital Profile Card for Personal Websites"
  }
];

export default function Hero() {
  const x = useMotionValue(600);
  const y = useMotionValue(600);

  const rotateX = useTransform(y, [0, 1400], [45, -45]);
  const rotateY = useTransform(x, [0, 1400], [-45, 45]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();

    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }
  function handleMouseLeave(event) {
    x.set(700);
    y.set(700);
  }

  const router = useRouter();
  return (
    <>
      <motion.section
        style={{ perspective: 1400 }}
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        className={styles.hero}
      >
        <div></div>
        <div className={styles.content}>
          <div>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>
              Connect, share, and network—anytime, anywhere.
            </p>
            <h1 className={styles.title} style={{ marginTop: "5px" }}>
              Transform your Brand networking to the
              {" "}
              <span className={styles.gradient}>next level</span> with 2TalkLink.
            </h1>
            <p className={styles.subtitle}>
              Create a stunning, interactive digital business card that’s easy to share and impossible to forget. Share it by text, email, WhatsApp, or a QR code. No more typing – tap, click, and connect instantly. Simplify networking and elevate your brand image with 2TalkLink.
            </p>
            <div className={styles.cta} style={{ justifyContent: "center" }}>
              <button
                className={styles.primaryButton}
                onClick={() => router.push("/auth/login")}
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
        <motion.div
          className={styles.visual}
          style={{ rotateX: rotateX, rotateY: rotateY }}
        >
          <div className={styles.phone}>
            <div className={styles.screen}>
              <Swiper
                effect={"cards"}
                grabCursor={true}
                loop={true}
                autoplay={{
                  delay: 1500,
                  pauseOnMouseEnter: true,
                }}
                // speed={3000}
                centeredSlides={true}
                navigation
                pagination={{ clickable: true }}
                modules={[EffectCards, Autoplay, Navigation]}
                className="mySwiper"
              >
                {cards.map((card) => (
                  <SwiperSlide key={card.src}>
                    <img
                      onMouseMove={(e) => {
                        e.stopPropagation();
                        handleMouseLeave(e);
                      }}
                      src={card.src}
                      style={{ height: "100%" }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          <div className={styles.decorations}>
            <div className={styles.circle}></div>
            <div className={styles.square}></div>
            <div className={styles.dots}></div>
          </div>
        </motion.div>
      </motion.section>
    </>
  );
}
