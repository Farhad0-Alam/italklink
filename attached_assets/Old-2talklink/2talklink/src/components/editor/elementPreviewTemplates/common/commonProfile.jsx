import styles from "../profile/Profile.module.css";


export default function CommonProfile(props) {
    return (
        <div
            className={
                styles.profile_wrapper +
                " " +
                styles["html_theme_t_common"] +
                " " +
                (props.isEditorPreview === true ? styles.editor_wrapper : "")
            }
            style={{ marginBottom: "5px" }}
        >
            {/* avatar */}
            <div
                className={`${styles.avatar + " " + (props.imageURL ? styles.has_image : "")
                    } ${styles.customAnimationLinear}`}
            >
                {props.imageURL ? (
                    <img
                        src={props.imageURL}
                        alt=""
                        style={{ width: "100%", height: "100%", borderRadius: "0" }}
                    />
                ) : null}
            </div>
        </div>

    );
}