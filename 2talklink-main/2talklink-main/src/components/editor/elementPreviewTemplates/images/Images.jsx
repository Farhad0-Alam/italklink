import styles from "./Images.module.css";
import svg from "../../../../helper/svg";

function Images(props) {

  return (
    <div
      className={
        styles.image_wrapper +
        "  " +
        (props.item?.animation
          ? `animate__animated animate__${
              props.item?.animation?.animationRepeat?.length == 1
                ? `repeat-${props.item?.animation.animationRepeat}`
                : props.item?.animation.animationRepeat
            }  animate__${props.item?.animation.name}`
          : "")
      }
      style={{
        animationDuration: props.item?.animation
          ? `${props.item?.animation?.animationDuration}ms`
          : "",
        animationDelay: props.item?.animation
          ? `${props.item?.animation?.animationDelay}ms`
          : "",
      }}
    >
      <h2
        style={{
          margin: 0,
          // position: "relative",
          // top: "-12px",
          fontSize: "20px",
          fontWeight: 500,
          zIndex: "9999",
          color: "var(--primary-color)",
        }}
      >
        {props?.item?.sectionData?.title}
      </h2>
      <div
        className={
          props.item.sectionData?.noOfImages === "Grid"
            ? styles.quardImage
            : props.item.sectionData?.noOfImages === "Full"
            ? styles.singleImage
            : styles.doubleImage
        }
      >
        {props.item.otherBusiness
          .slice(
            0,
            props.item.sectionData?.noOfImages === "Grid"
              ? undefined
              : props.item.sectionData?.noOfImages === "Split"
              ? 2
              : 1
          )
          .map((val, i) => (
            <div key={i} className={styles.image_box}>
              <a href={val.url} target="_blanck">
                <img src={process.env.s3URL + val.image} />
              </a>
            </div>
          ))}
        {[1, 2, 3, 4]
          .slice(
            0,
            props.item.sectionData?.noOfImages === "Grid"
              ? props.item.otherBusiness.length <= 4 &&
                  4 - props.item.otherBusiness.length
              : props.item.sectionData?.noOfImages === "Split"
              ? props.item.otherBusiness.length <= 2 &&
                2 - props.item.otherBusiness.length
              : props.item.otherBusiness.length < 1 && 1
          )
          .map((val) => (
            <div className={styles.single_image_box} key={val}>
              {svg["imageIcon"]}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Images;
