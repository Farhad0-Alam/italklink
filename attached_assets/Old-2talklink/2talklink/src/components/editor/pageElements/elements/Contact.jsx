import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { compose } from "redux";
import { saveSectionACT } from "../../../../redux/actions/editorAction";

const Contact = (props) => {
    let dispatch = useDispatch();
    const [contactType, setContactType] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const data = props.data.sectionData;
        setContactType(data.type);
        setName(data.title);
        setEmail(data.email);
    }, [props]);

    const updateName = (e) => {
        e.preventDefault()
        if (props.data.sectionData.title !== name) {
            const data = { ...props.data };
            data.sectionData.title = e.target.value;
            dispatch(saveSectionACT(data));
        }
    };
    const updateEmail = (e) => {
        e.preventDefault()
        if (props.data.sectionData.email !== email) {
            const data = { ...props.data };
            data.sectionData.email = e.target.value;
            data.sectionData.type = contactType;
            dispatch(saveSectionACT(data));
        }
    };
    return (
        <>
            <form onSubmit={(e) => updateName(e)}>
                <div className="pu_input_wrapper">
                    <label>Contact Title</label>
                    <input
                        placeholder="Enter your contact title"
                        id={"el_" + props.data._id}
                        type="text"
                        className="pu_input"
                        defaultValue={props.data.sectionData?.title}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={(e) => updateName(e)}
                    />
                </div>
            </form>
            <>
                <form onSubmit={(e) => updateEmail(e)}>
                    <div className="pu_input_wrapper">
                        <label>Receiver Email</label>
                        <input
                            placeholder="Enter your receiver email address"
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
export default compose(connect(mapStateToProps, null))(Contact);
