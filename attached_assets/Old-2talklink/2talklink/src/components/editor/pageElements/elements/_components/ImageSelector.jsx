import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { icons } from "../../../../../../icons/icons";
import { saveSectionACT } from "../../../../../redux/actions/editorAction";

const CustomDropdown = ({ type, data, secondaryColor, bgColor }) => {
    
  const customIcon = icons({
    fillColor: "#111",
    width: "30px",
    height: "30px",
  });
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(
    customIcon.find((ico) => ico.type === type) || customIcon[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (data.sectionData?.icon) {
      setSelectedOption(data.sectionData.icon);
      dispatch(data);
    } else {
      const icon = customIcon.find((ico) => ico.type === type) || customIcon[0];
      setSelectedOption(icon);

      const newData = { ...data };
      newData.sectionData.icon = icon;
      dispatch(newData);
    }
  }, [type]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (icon) => {
    setSelectedOption(icon);
    setIsOpen(false);
    const newData = { ...data };
    newData.sectionData.icon = icon;

    dispatch(saveSectionACT(newData));
  };

  return (
    <div className="pu_input_wrapper" style={{ marginBottom: "0" }}>
      <div
        style={{ padding: "2px" }}
        className="custom-select pu_input"
        ref={dropdownRef}
      >
        <div className="select-selected" onClick={() => setIsOpen(!isOpen)}>
          <span
            dangerouslySetInnerHTML={{
              __html: selectedOption.icon,
            }}
          ></span>
          {selectedOption.label}
        </div>
        {isOpen && (
          <div className="select-items">
            {customIcon.map((icon) => (
              <div key={icon.id} onClick={() => handleSelect(icon)}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: icon.icon,
                  }}
                ></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
