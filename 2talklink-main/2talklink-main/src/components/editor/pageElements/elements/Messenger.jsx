import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { compose } from "redux";
import { saveSectionACT } from "../../../../redux/actions/editorAction";

const Messenger = (props) => {
    let dispatch = useDispatch();
    const [messengerType, setMessengerType] = useState("");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const data = props.data.sectionData;
        setMessengerType(data.type);
        setName(data.title);
        setUsername(data.username);
    }, [props]);

    const updateName = (e) => {
        if (props.data.sectionData.title !== name) {
            const data = { ...props.data };
            data.sectionData.title = e.target.value;
            dispatch(saveSectionACT(data));
        }
    };
    const updateSms = (e) => {
        if (props.data.sectionData.username !== username) {
            const data = { ...props.data };
            data.sectionData.username = e.target.value;
            data.sectionData.type = messengerType;
            dispatch(saveSectionACT(data));
        }
    };
    return (
        <>
            <form onSubmit={(e) => updateName(e)}>
                <div className="pu_input_wrapper">
                    <label>Messenger Title</label>
                    <input
                        id={"el_" + props.data._id}
                        type="text"
                        className="pu_input"
                        defaultValue={props.data.sectionData.title}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={(e) => updateName(e)}
                    />
                </div>
            </form>
            <>
                <form onSubmit={(e) => updateSms(e)}>
                    <div className="pu_input_wrapper">
                        <label>Messenger</label>
                        <input
                            type="text"
                            className="pu_input"
                            defaultValue={props.data.sectionData.username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={(e) => updateSms(e)}
                        />
                    </div>
                </form>
            </>
        </>
    );
};

const mapStateToProps = (state) => {
    return {
        pages: state.editor.pages,
    };
};
export default compose(connect(mapStateToProps, null))(Messenger);
