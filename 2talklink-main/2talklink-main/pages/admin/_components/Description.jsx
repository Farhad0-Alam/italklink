import dynamic from "next/dynamic";
import { useState } from "react";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

const Description = ({ setDescription, description }) => {
  const [editorContent, setEditorContent] = useState(description);

  const handleEditorChange = (content) => {
    setEditorContent(content);
    setDescription(content);
  };


  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="pu_input_wrapper">
        <ReactQuill
          value={editorContent}
          onChange={handleEditorChange}
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
        />
      </div>
    </form>
  );
};

export default Description;
