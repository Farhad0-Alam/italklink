import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { compose } from "redux";
import { saveSectionACT } from "../../../../redux/actions/editorAction";

const Whatsapp = (props) => {
    let dispatch = useDispatch();
    const [whatsAppType, setWhatsAppType] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const data = props.data.sectionData;
        setWhatsAppType(data.type);
        setName(data.title);
        setPhone(data.phone);
    }, [props]);

    const updateName = (e) => {
        if (props.data.sectionData.title !== name) {
            const data = { ...props.data };
            data.sectionData.title = e.target.value;
            dispatch(saveSectionACT(data));
        }
    };
    const updateSms = (e) => {
        if (props.data.sectionData.phone !== phone) {
            const data = { ...props.data };
            data.sectionData.phone = e.target.value;
            data.sectionData.type = whatsAppType;
            dispatch(saveSectionACT(data));
        }
    };
    return (
        <>
            <form onSubmit={(e) => updateName(e)}>
                <div className="pu_input_wrapper">
                    <label>Whatsapp Title</label>
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
                        <label>Whatsapp</label>
                        <input
                            type="text"
                            className="pu_input"
                            defaultValue={props.data.sectionData.phone}
                            onChange={(e) => setPhone(e.target.value)}
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
export default compose(connect(mapStateToProps, null))(Whatsapp);
