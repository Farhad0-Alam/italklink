import dynamic from "next/dynamic";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { saveSectionACT } from "../../../../redux/actions/editorAction";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

const Accordion = (props) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState(props.data.sectionData.description);
  const [title, setTitle] = useState(props.data.sectionData.title);

  const updateDescription = () => {
    if (props.data.sectionData.description !== description) {
      const data = { ...props.data };
      data.sectionData.description = description;
      dispatch(saveSectionACT(data));
    }
  };

  const updateTitle = (e) => {
    e.preventDefault();
    if (props.data.sectionData.title !== title) {
      const data = { ...props.data };
      data.sectionData.title = title;
      dispatch(saveSectionACT(data));
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="pu_input_wrapper">
        {/* Title Input */}
        <input
          style={{ marginBottom: "8px" }}
          type="text"
          id={"title_" + props.data._id}
          className="pu_input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => updateTitle(e)} // Update title on blur
          placeholder="Enter Title"
        />

        {/* Description Editor */}
        <ReactQuill
          value={description}
          onChange={setDescription}
          onBlur={updateDescription} // Update description on blur
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ script: "sub" }, { script: "super" }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [
                { align: "" },
                { align: "center" },
                { align: "right" },
                { align: "justify" },
              ],
              ["link"],
              ["clean"],
            ],
          }}
          formats={[
            "header",
            "bold",
            "italic",
            "underline",
            "strike",
            "color",
            "background",
            "script",
            "list",
            "bullet",
            "indent",
            "align",
            "link",
          ]}
          style={{ minHeight: "250px !important" }}
        />
      </div>
    </form>
  );
};

export default Accordion;
