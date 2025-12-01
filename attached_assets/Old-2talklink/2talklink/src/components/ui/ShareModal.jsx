import { useEffect, useRef } from "react";
import useVcard from "../../hooks/useVcard";
import QRCodeGenerator from "./QrCode";
import styles from "./share-modal.module.css";

// Import next-share components
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from "next-share";

export default function ShareModal({ onClose, ...extra }) {
  const modalRef = useRef(null);

  const { name, template, linkSlug } = extra || {};
  const { profile, templateStyle } = template || {};
  const { primary_color, bgcolor, secondary_color } = templateStyle || {};

  const { image } = profile || {};

  const shareUrl = `${process.env.APP_URL}${linkSlug}`;
  const { handleVcard } = useVcard(extra);

  const message = `Check this link: ${shareUrl}`;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal(); // Call close with animation
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleCloseModal = () => {
    onClose();
  };

  const handleShareText = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-labelledby="modal-title"
        style={{ backgroundColor: bgcolor }}
      >
        <div style={{ position: "relative" }}>
          <span
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              fill={primary_color}
              height="1rem"
              width="1rem"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 490 490"
              xmlSpace="preserve"
            >
              <polygon
                points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 
        489.292,457.678 277.331,245.004 489.292,32.337 "
              />
            </svg>
          </span>
          <h2 className={styles.title} style={{ color: primary_color }}>
            {name}
          </h2>
        </div>
        <div style={{ display: "flex" }}>
          <QRCodeGenerator
            primary_color={primary_color}
            logoUrl={`${process.env.s3URL}${image}`}
            className={styles.qrCode}
          />
        </div>
        <h3 className={styles.subtitle} style={{ color: primary_color }}>
          Share Card
        </h3>
        <div className={styles.buttonGrid}>
          {/* Facebook Share Button */}
          <FacebookShareButton url={shareUrl}>
            <span className={`${styles.shareButton} ${styles.facebook}`}>
              Facebook
            </span>
          </FacebookShareButton>

          {/* Twitter Share Button */}
          <TwitterShareButton url={shareUrl}>
            <span className={`${styles.shareButton} ${styles.twitter}`}>
              Twitter
            </span>
          </TwitterShareButton>

          {/* Email Share Button */}
          <EmailShareButton url={shareUrl}>
            <span className={`${styles.shareButton} ${styles.email}`}>
              Email
            </span>
          </EmailShareButton>

          {/* LinkedIn Share Button */}
          <LinkedinShareButton url={shareUrl}>
            <span className={`${styles.shareButton} ${styles.linkedin}`}>
              LinkedIn
            </span>
          </LinkedinShareButton>

          {/* Telegram Share Button */}
          <TelegramShareButton url={shareUrl}>
            <span className={`${styles.shareButton} ${styles.telegram}`}>
              Telegram
            </span>
          </TelegramShareButton>

          {/* WhatsApp Share Button */}
          <WhatsappShareButton url={shareUrl}>
            <span className={`${styles.shareButton} ${styles.whatsapp}`}>
              WhatsApp
            </span>
          </WhatsappShareButton>
        </div>

        <div>
          <button
            variant="ghost"
            onClick={handleVcard}
            className={styles.saveContact}
          >
            Save Contact
          </button>
        </div>
        <button
          style={{ marginTop: "10px" }}
          className={styles.textShare}
          onClick={handleShareText}
        >
          <svg
            className={styles.shareIcon}
            viewBox="0 0 24 24"
            width={24}
            height={24}
            stroke="#00ff00"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx={18} cy={5} r={3} />
            <circle cx={6} cy={12} r={3} />
            <circle cx={18} cy={19} r={3} />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share by text
        </button>
      </div>
    </div>
  );
}
