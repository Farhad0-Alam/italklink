import { ElementConfig, ElementRendererProps } from "../registry/types";
import { TextEditorRenderer } from "./renderer";
import { TextEditorEditor } from "./editor";

function TextEditorElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <TextEditorEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <TextEditorRenderer {...props} />;
}

export const textEditorConfig: ElementConfig = {
  metadata: {
    type: "textEditor",
    title: "Text Editor",
    icon: "FileText",
    category: "Basic",
    description: "WYSIWYG text editor with rich formatting options"
  },
  defaultData: () => ({ 
    content: "<p>Add your text here. Click to edit and customize your content with various formatting options.</p>",
    alignment: "left" as const,
    fontSize: 16,
    fontWeight: "normal",
    lineHeight: 1.6,
    letterSpacing: "normal",
    dropCap: false,
    columns: 1
  }),
  Renderer: TextEditorElementRenderer,
  Editor: TextEditorEditor
};

export default textEditorConfig;
