import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { saveSectionACT } from "../../../../redux/actions/editorAction";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

const Paragraph = (props) => {
  let dispatch = useDispatch();
  const [pragraph, setPragraph] = useState(
    props.data.sectionData?.paragraph || ""
  );
  const [title, setTitle] = useState(props.data.sectionData?.title || "");

  const updateParagraph = (e) => {
    if (props.data.sectionData?.paragraph !== pragraph) {
      const data = { ...props.data };
      data.sectionData.paragraph = pragraph;
      dispatch(saveSectionACT(data));
    }
  };

  const updateTitle = (e) => {
    e.preventDefault();
    if (props.data.sectionData?.title !== title) {
      const data = { ...props.data };

      data.sectionData.title = title;
      dispatch(saveSectionACT(data));
    }
  };

  return (
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
      <ReactQuill
        value={pragraph}
        onChange={setPragraph}
        onBlur={updateParagraph}
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
  );
};

export default Paragraph;
