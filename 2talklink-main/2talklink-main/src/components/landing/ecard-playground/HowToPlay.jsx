import { useState } from "react";
import Popup from "../../common/popup/Popup";
import styles from "./page.module.css";
import ReactPlayer from "react-player/lazy";
export default function HowToPlay() {
  const [showVideo, setShowVideo] = useState(false);
  const popupCloseHandler = () => setShowVideo(false);
  return (
    <>
      <div
        onClick={() => setShowVideo(true)}
        className={styles.videoPlayButton}
        title="How to use playground"
      >
        <span></span>
      </div>
      {showVideo && (
        <Popup
          heading="How to use playground"
          subHeading="A step-by-step guide to get started"
          maxWidth="630px"
          show={showVideo}
          onClose={popupCloseHandler}
        >
          <div className={`${styles.playerFirstDiv} ${styles.boxBorder}`}>
            <ReactPlayer
              style={{ borderRadius: "10px" }}
              playing={true}
              controls={true}
              stopOnUnmount={true}
              url="https://www.youtube.com/watch?v=oTTx9Mido9Y"
            />
          </div>
        </Popup>
      )}
    </>
  );
}
