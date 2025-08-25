import React from "react";
import styles from "../../../../styles/pages/LandingPage.module.css";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { Share2 } from "lucide-react";
import { UserPlus2 } from "lucide-react";
import { Home } from "lucide-react";
export default function CoreFeaturesSection() {
  return (
    <div
      id="core-feature"
      className={styles.core_feature}
      style={{ background: "#001F3F" }}
    >
      <div className="pu_container">
        <div className={styles.core_feature_content}>
          <div className={styles.core_feature_right}>
            <div className={styles.main_heading}>
              <h3 style={{ color: "#fff", textAlign: "center" }}>
                Easily Share Your Business Details with One Link
              </h3>
            </div>
            <p style={{ color: "#fff" }}>
              Make a lasting first impression with your 2TalkLink Digital Business Card. With just one link or QR code, you can instantly share your professional contact details, social media profiles, website, portfolio, and more. This next-generation tool streamlines how you connect and helps you attract more leads, close deals faster, and grow your business quickly.
            </p>
            <p style={{ color: "#fff" }}>
              <b>Bonus Feature:</b> Interactive Email Signature Generator-Create a professional, interactive email signature that’s easy to implement. This will add even more ways for prospects and clients to connect with you directly.
            </p>
            <div style={{ textAlign: "right" }}><Link href="/auth/login">
              <a className="pu_btn">Know More</a>
            </Link></div>
          </div>
          <div className={styles.core_feature_left}>
            <div className={styles.core_feature_box}>
              <div style={{ padding: "10px", background: "#ff6f61", width: "100px", height: "100px", margin: "auto", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Share2 size={"30"} />
              </div>
              <h3>Instant Access</h3>
              <p>
                Easily share your digital business card via text, email, WhatsApp, social media, and QR code. There is no need to type—tap and connect instantly.
              </p>
            </div>
            <div className={styles.core_feature_box}>
              <div style={{ padding: "10px", background: "#007fff", width: "100px", height: "100px", margin: "auto", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings2 size={"30"} />
              </div>
              <h3>Customizable & Interactive</h3>
              <p>
                Personalize your card with logos, social profiles, and contact info. All details are interactive—click to call, email, or visit your website with one tap.
              </p>
            </div>
            <div className={styles.core_feature_box}>
              <div style={{ padding: "10px", background: "#008080", width: "100px", height: "100px", margin: "auto", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserPlus2 size={"30"} />
              </div>
              <h3>Add to Contacts</h3>
              <p>
                Let your prospects easily download and save your contact info to their smartphones. This seamless feature makes staying connected effortless.
              </p>
            </div>
            <div className={styles.core_feature_box}>
              <div style={{ padding: "10px", background: "#b31942", width: "100px", height: "100px", margin: "auto", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Home size={"30"} />
              </div>
              <h3>Add to Home Screen</h3>
              <p className="last-para-txt">
                Let prospects add your 2TalkLink card to their home screen for quick access. This will keep you at the top of your mind and ensure you are always accessible with just one tap.
                Fully Supported on iPhone, Android, Desktop, and Tablets – Connect effortlessly from any device.
              </p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button className="pu_btn" style={{ marginTop: "2.5rem" }}><Link href={"/pricing"}>Try It Free for 7 Days</Link></button>
        </div>
      </div>
    </div>
  );
}
