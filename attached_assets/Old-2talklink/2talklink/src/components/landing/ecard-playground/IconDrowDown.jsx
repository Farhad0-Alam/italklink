import React, { useEffect, useRef, useState } from "react";
import { icons } from "../../../../icons/icons";
const CustomDropdown = ({ type, data, onActiveIcon }) => {
  const customIcon = icons({
    fillColor: "#111",
    width: "18px",
    height: "18px",
  });
  const [selectedOption, setSelectedOption] = useState(
    customIcon.find((ico) => ico.type === type) || customIcon[0]
  );

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (data?.activeIcon) {
      setSelectedOption(data.activeIcon);
    } else {
      const icon = customIcon.find((ico) => ico.type === type) || customIcon[0];
      setSelectedOption(icon);
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
    onActiveIcon(icon);
    setIsOpen(false);
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
          <div className="select-items" style={{ width: "100%" }}>
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
