import ImageFlip from "./ImageFlip";

export default function Card({ ecard, swiperRef }) {
  const borderRadius = ecard?.rounded;
  const styles = { width: ecard?.width };
  if (borderRadius) {
    styles.borderRadius = borderRadius;
  }

  return (
    <ImageFlip
      swiperRef={swiperRef}
      customStyles={styles}
      frontImage={ecard?.img}
      background={ecard?.background}
      username={ecard?.username}
      link={ecard?.link}
    />
  );
}
