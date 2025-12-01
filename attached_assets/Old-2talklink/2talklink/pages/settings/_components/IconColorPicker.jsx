import { useState } from "react";
import { HuePicker, SketchPicker, TwitterPicker } from "react-color";

export default function IconColorPicker({ title }) {
  const [primaryColorSt, setPrimaryColorSt] = useState("");
  const materialColors = [
    "#EF5350",
    "#EC407A",
    "#AB47BC",
    "#7E57C2",
    "#5C6BC0",
    "#42A5F5",
    "#29B6F6",
    "#26C6DA",
    "#26A69A",
    "#66BB6A",
    "#9CCC65",
    "#D4E157",
    "#FFEE58",
    "#FFCA28",
    "#FFA726",
    "#FF7043",
    "#8D6E63",
    "#78909C",
  ];

  const colorPickerChange = (type, color) => {
    if (color.hex) {
      var color = color.hex;
      if (type === "primary_color") {
        setPrimaryColorSt(color.toString());
      }
    }
  };

  const colorPickerOpener = (type) => {
    // var typeColor = '';
    // if(type === 'bgcolor'){
    //     typeColor = metaData.bgcolor;
    // }else if(type === 'headingcolor'){
    //     typeColor = metaData.headingcolor;
    // }else if(type === 'textcolor'){
    //     typeColor = metaData.textcolor;
    // }
  };

  const colorPickerComplete = (type, color) => {
    if (color.hex) {
      var color = color.hex;
      const copyMetaData = {};
      if (type === "primary_color") {
        copyMetaData.primary_color = color.toString();
      }
      // setMetaData(copyMetaData);
    }
  };
  return (
    <>
      <div className="pu_input_wrapper">
        {title}
        <div className="pu_color_picker_wrapper">
          <div
            className="pu_color_picker_toggle"
            onClick={() => colorPickerOpener("primary_color")}
          >
            <span className="pu_color_name">{primaryColorSt}</span>
            <span
              className="pu_color_preview"
              style={{ backgroundColor: primaryColorSt }}
            ></span>
          </div>
          <div className="pu_color_picker_dropdown">
            <SketchPicker
              color={primaryColorSt}
              onChange={(color) => colorPickerChange("primary_color", color)}
              onChangeComplete={(color) =>
                colorPickerComplete("primary_color", color)
              }
            />
            <HuePicker
              color={primaryColorSt}
              onChange={(color) => colorPickerChange("primary_color", color)}
              onChangeComplete={(color) =>
                colorPickerComplete("primary_color", color)
              }
              width={276}
            />
            <TwitterPicker
              color={primaryColorSt}
              onChange={(color) => colorPickerChange("primary_color", color)}
              onChangeComplete={(color) =>
                colorPickerComplete("primary_color", color)
              }
              width={276}
              colors={materialColors}
            />
          </div>
        </div>
      </div>
    </>
  );
}
