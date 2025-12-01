import { motion } from "framer-motion";
import styles from "./footer-bottom.module.css";
import Image from "next/image";
const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};
export default function FooterBottom() {
  return (
    <>
      <motion.div className={styles.bottom} variants={itemVariants}>
        <div className={styles.divider} />
        <div className={styles.links}>
          {/* <Link href="/about" className={styles.link}>
                About Us
              </Link> */}
          <a href="/privacy-and-policy" className={styles.link}>
            Privacy Policy
          </a>
          <a href="/terms-of-service" className={styles.link}>
            Terms of Service
          </a>
          <a href="/contact" className={styles.link}>
            Contact
          </a>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          margin: "15px 0"
        }}>
          <Image
            src="/stripe-payments.jpeg"
            alt="Payment methods: Visa, MasterCard, Maestro, American Express, Discover - Powered by Stripe"
            style={{ borderRadius: "10px" }}
            width={350}
            height={80}
            className="payment-image"
          />
        </div>

        <p className={styles.copyright} style={{ margin: 0, color: "#f7f9ff" }}>
          Copyright © {new Date().getFullYear()}, Farhad Digital Solutions LLC.
          All Rights Reserved. 2TalkLink is a subsidiary of Farhad Digital
          Solutions LLC.
        </p>
      </motion.div>
    </>
  );
}
