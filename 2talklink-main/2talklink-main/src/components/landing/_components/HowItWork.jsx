import Link from "next/link";
import styles from "../../../../styles/pages/LandingPage.module.css";
import svg from "../../../helper/svg";
import stylesBorder from "../ecard-playground/page.module.css";
import { ArrowBackIos } from "@mui/icons-material";
import { ArrowForward } from "@mui/icons-material";
export default function HowItWork() {
  return (
    <>
      <div
        className={styles.works}
        id="how-it-work"
        style={{ background: "#B31942" }}
      >
        <div className="pu_container">
          <div className={styles.main_heading}>
            <h3>Create Your Digital Business Card in 3 Easy Steps</h3>
            <strong style={{ width: "70%", margin: "auto" }}>
              Building a stunning digital business card has never been easier. With <span className={styles.gradient}>2TalkLink</span>, you can create a fully personalized, interactive card in just a few minutes. Follow these simple steps to showcase your brand and start connecting instantly!
            </strong>
          </div>
          <div className={styles.works_content}>
            <div className={styles.works_right}>
              <div className={styles.works_video}>
                <div
                  className={`${styles.video_container} ${stylesBorder?.howItWorkBoxBorder}`}
                >
                  <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/nNYcDxOK54g?si=5zAO8ePVO6q7jfYv"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <div className="text-center">
                <button className="pu_btn"><Link href={"/templates"}><>Build Your Card in Minutes <ArrowForward /></></Link></button>
              </div>
            </div>
            <div className={styles.works_left}>
              <div className={styles.works_box}>
                <div className={styles.works_box_icon}>
                  {svg.landing_temp_icon}
                </div>
                <div className={styles.works_box_data}>
                  <h3>Choose Your Template</h3>
                  <p>
                    Select from over 10 unique, stylish templates that perfectly match your brand's personality.
                  </p>
                </div>
              </div>
              <div className={styles.works_box}>
                <div className={styles.works_box_icon}>
                  {svg.landing_edit_icon}
                </div>
                <div className={styles.works_box_data}>
                  <h3> Customize Your Details</h3>
                  <p>Add your logo, contact information, social profiles, and clickable links to make your card yours.</p>
                </div>
              </div>
              <div className={styles.works_box}>
                <div className={styles.works_box_icon}>
                  {svg.landing_share_icon}
                </div>
                <div className={styles.works_box_data}>
                  <h3>Share & Connect</h3>
                  <p>
                    Once you're done, please copy the link and share it via text, email, or social media to start networking immediately!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
