import { motion } from "framer-motion";
import stylesNew from "./footer.module.css";
import styles from "../../../../styles/pages/LandingPage.module.css";
import FooterBottom from "./FooterBottom";

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

const contactCardVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "#111",
      }}
    >
      <section className={styles.stylesNew}>
        <div className={styles.stylesNew}>
          <motion.div
            className={styles.stylesNew}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className={styles.footer__wr}>
              <div className="pu_container">
                <div className={styles.footer_main_box}>
                  <div
                    className={`${styles.footer_item} ${styles.footer_list_1}`}
                  >
                    <div className={styles.logo_footer}>
                      <img src="/images/2TalkLink-Logo.png" width="150px" />
                    </div>
                    <p style={{ color: "#fff" }}>
                      2TalkLink allows you to create a custom, personalized page
                      that stores all the prominent links you wish to share with
                      your viewers.
                    </p>
                  </div>
                  <a
                    href="mailto:contact@2talklink.com"
                    className={`${styles.footer_item} ${styles.footer_list_2}`}
                  >
                    <div className={styles.footer_icon}>
                      <img src="./images/landing/Shape 603.png" alt="shape" />
                    </div>
                    <div className={`${styles.footer_info} custom-footer-info`}>
                      <h3>Email Address</h3>
                      <p style={{ color: "#ff6f61" }}>contact@2talklink.com</p>
                    </div>
                  </a>
                  <a
                    href="sms:+13074435831"
                    className={`${styles.footer_item} ${styles.footer_list_3}`}
                  >
                    <div className={styles.footer_icon}>
                      <img src="./images/landing/Shape 600.png" alt="shape" />
                    </div>
                    <div className={styles.footer_info}>
                      <h3>Text Here</h3>
                      <span style={{ color: "#007fff" }}>+1(307) 443-5831</span>
                    </div>
                  </a>
                  <a
                    href={`https://wa.me/${8801724778142}`}
                    className={`${styles.footer_item} ${styles.footer_list_4}`}
                  >
                    <div className={styles.footer_icon}>
                      <img src="./images/landing/Shape 602.png" alt="shape" />
                    </div>
                    <div className={styles.footer_info}>
                      <h3>Whatsapp Chat</h3>
                      <p>
                        <span>Click Here to Chat</span>
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <FooterBottom />
    </footer>
  );
}
