import { CircularProgress } from "@mui/material";
import { connect } from "react-redux";
import { compose } from "redux";

import styles from "../../../styles/common/autoSave.module.css";

const autoSaveLoader = (props) => {
    if (props.editor.autoSaveStatus === true) {
        return (
            <>
                <div className={styles.autosave + " " + styles.saving}>
                    <CircularProgress
                        size={20}
                        thickness={3}
                    />
                    <p>Saving</p>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className={styles.autosave + " " + styles.saved}>
                    <img
                        src="/images/favicon.png"
                        width={140}
                        alt=""
                    />
                    <p>Saved</p>
                </div>
            </>
        );
    }
};

const mapStateToProps = (state) => {
    return {
        ...state,
    };
};

/* const mapDispatchToProps = (dispatch) => {
	return {
        editorAutoSave: (params) => dispatch(editorAutoSave(params)),
	};
}; */

export default compose(connect(mapStateToProps, null))(autoSaveLoader);
