"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { PhoneCall, Palette, MousePointerClick, Mail, QrCode, Search, Link, ShieldCheck, Users, Pencil, Zap } from "lucide-react";
import styles from "./features.module.css";
import { useRouter } from "next/router";

const features = [
  {
    "icon": <PhoneCall />,
    "title": "Instant Connect",
    "description": "Make it effortless for prospects and clients to contact you. Clients can call, email, or message you with one tap, making communication quick and easy.",
    "color": "var(--gradient-1)"
  },
  {
    "icon": <Palette />,
    "title": "Customizable Templates",
    "description": "Choose from a wide selection of stylish and professional templates. Just add your logo, contact info, social profiles, and more.",
    "color": "var(--gradient-2)"
  },
  {
    "icon": <MousePointerClick />,
    "title": "Clickable Connections",
    "description": "With just a click, recipients can connect with you in different ways. They can call, email, text, or visit your website.",
    "color": "var(--gradient-3)"
  },
  {
    "icon": <Mail />,
    "title": "Email Signature Generator",
    "description": "2TalkLink creates an interactive email signature from your eCard link info, including your phone number, email, website, and more.",
    "color": "var(--gradient-4)"
  },
  {
    "icon": <QrCode />,
    "title": "QR Code Generation",
    "description": "Create a unique QR code for your digital business card. Anyone can scan it to get instant access.",
    "color": "var(--gradient-5)"
  },
  {
    "icon": <Search />,
    "title": "SEO-Optimized Google Integration",
    "description": "Optimizing your digital card for Google Search will boost your online presence and help others easily find and connect with you.",
    "color": "var(--gradient-6)"
  },
  {
    "icon": <Link />,
    "title": "One-Click Access",
    "description": "Share your contact details with one link or QR code. It makes it simple for your network to reach out and connect.",
    "color": "var(--gradient-7)"
  },
  {
    "icon": <ShieldCheck />,
    "title": "Secure and Reliable",
    "description": "Your digital business card is safe and easily accessible from any device whenever you need it.",
    "color": "var(--gradient-8)"
  },
  {
    "icon": <Users />,
    "title": "Social Media Links",
    "description": "Include social media profile links, portfolio, website, and Google Maps location for an excellent experience.",
    "color": "var(--gradient-9)"
  },
  {
    "icon": <Pencil />,
    "title": "Unlimited Edits",
    "description": "You can update your digital business card anytime to keep your contact information up to date.",
    "color": "var(--gradient-10)"
  },
  {
    "icon": <Zap />,
    "title": "Quick & Easy Setup",
    "description": "Create your digital business card in minutes—no design or tech skills required.",
    "color": "var(--gradient-11)"
  }
]


export default function Features() {
  const containerRef = useRef(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

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
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <section className={styles.section} ref={containerRef}>
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className={styles.header} variants={itemVariants}>
          <span className={styles.badge} >Features</span>
          <h2>Offering Innovative Way to Connect And Grow</h2>
          <p>
            Transform your online identity with our premium design solutions
          </p>
        </motion.div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={styles.featureCard}
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              style={{
                "--feature-gradient": feature.color,
              }}
            >
              <div className={styles.iconWrapper}>
                {feature.icon}
                <div className={styles.iconBackground} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className={styles.shine} />
            </motion.div>
          ))}
        </div>

        <motion.div className={styles.ctaSection} variants={itemVariants}>
          <div className={styles.ctaContent}>
            <h3>Ready to Get Started?</h3>
            <p>
              Join thousands of satisfied customers who trust our premium
              solutions
            </p>
            <button
              onClick={() => router.push("/pricing")}
              style={{ gap: "5px" }}
              className={`${styles.ctaButton} pu_btn`}
            >
              Get Premium Access
              <span className={styles.sparkle}>✨</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
