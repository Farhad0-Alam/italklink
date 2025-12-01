import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { compose } from "redux";
import { saveSectionACT } from "../../../../redux/actions/editorAction";

const Email = (props) => {
    let dispatch = useDispatch();
    const [emailType, setEmailType] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const data = props.data.sectionData;
        setEmailType(data.type);
        setName(data.title);
        setEmail(data.email);
    }, [props]);

    const updateName = (e) => {
        if (props.data.sectionData.title !== name) {
            const data = { ...props.data };
            data.sectionData.title = e.target.value;
            dispatch(saveSectionACT(data));
        }
    };
    const updateEmail = (e) => {
        if (props.data.sectionData.email !== email) {
            const data = { ...props.data };
            data.sectionData.email = e.target.value;
            data.sectionData.type = emailType;
            dispatch(saveSectionACT(data));
        }
    };
    return (
        <>
            <form onSubmit={(e) => updateName(e)}>
                <div className="pu_input_wrapper">
                    <label>Title</label>
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
                <form onSubmit={(e) => updateEmail(e)}>
                    <div className="pu_input_wrapper">
                        <label>Email</label>
                        <input
                            type="email"
                            className="pu_input"
                            defaultValue={props.data.sectionData.email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={(e) => updateEmail(e)}
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
export default compose(connect(mapStateToProps, null))(Email);
