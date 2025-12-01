import { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { compose } from "redux";
import { countryCodes } from "../../../../../utils/countryCodes";
import generateSocialLink from "../../../../../utils/generateSocialLink";
import { saveSectionACT } from "../../../../redux/actions/editorAction";
import CustomDropdown from "./_components/ImageSelector";
import Type from "./_components/Type";

const placeholder = {
  link: "Enter your website link",
  email: "Enter your email",
  phone: "Enter your phone number",
  sms: "Enter your text number",
  whatsapp: "Enter your WhatsApp number",
  skype: "Enter your username/phone",
  messenger: "Enter your username",
  facebook: "Enter your username",
  instagram: "Enter your username",
  youtube: "Enter your channel name",
  tiktok: "Enter your username",
  pinterest: "Enter your username",
  location: "Enter your address",
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10,15}$/; // Adjust the regex based on your phone number format
  return re.test(phone);
};
function ValidURL(str) {
  const pattern = new RegExp(
    `^(https?:\\/\\/)?` + // protocol
      `((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|` + // domain name
      `(\\d{1,3}\\.){3}\\d{1,3})` + // OR ip (v4) address
      `(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*` + // port and path
      `(\\?[;&a-z\\d%_.~+=-]*)?` + // query string
      `(\\#[-a-z\\d_]*)?$`, // fragment locator
    "i"
  );
  if (!pattern.test(str)) {
    return false;
  } else {
    return true;
  }
}

const Link = (props) => {
  let dispatch = useDispatch();
  const [pageType, setPageType] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [isPageEnable, setIsPageEnable] = useState(false);
  const data = props.data.sectionData;
  const [type, setType] = useState(data?.type || "link");
  const [error, setError] = useState("");
  const [countryPhoneCode, setCountryPhoneCode] = useState("+1");
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const data = props.data.sectionData;
    setPageType(data.pageType || data.type);
    setType(data.type);
    setCountryPhoneCode(data.countryCode || "+1");
    setIsPageEnable(data.pageType === "page" || data.type === "page");
    setName(data.title);
    setUrl(data.url);
    setPageSlug(data.pageSlug);
  }, [props]);

  const updateName = (e) => {
    e.preventDefault();
    if (props.data.sectionData.title !== name) {
      const data = { ...props.data };
      data.sectionData.title = e.target.value;
      dispatch(saveSectionACT(data));
    }
  };

  const typeChangeHandle = (ltype) => {
    setIsPageEnable(ltype === "page");
    setPageType(ltype);
    const data = { ...props.data };
    data.sectionData.pageType = ltype;
    dispatch(saveSectionACT(data));
  };

  const validateInput = () => {
    if (type === "email" && !validateEmail(url)) {
      setError("Invalid email format.");
      return false;
    }
    if ((type === "phone" || type === "whatsapp") && !validatePhone(url)) {
      setError("Invalid phone number format.");
      return false;
    }
    setError("");
    return true;
  };

  const updateLink = (value, change) => {
    if (props.data.sectionData.url !== value) {
      const data = { ...props.data };
      data.sectionData.url = value;
      data.sectionData.type = type;
      const types = ["whatsapp", "phone"];
      if (types.includes(type)) {
        data.sectionData.fullURL = generateSocialLink(
          countryPhoneCode.trim() + value
        )[type];
      } else {
        data.sectionData.fullURL = generateSocialLink(value)[type];
      }
      dispatch(saveSectionACT(data));
    }
    if (change) {
      const data = { ...props.data };
      data.sectionData.url = value;
      data.sectionData.type = type;
      const types = ["whatsapp", "phone"];
      if (types.includes(type)) {
        data.sectionData.fullURL = generateSocialLink(
          countryPhoneCode.trim() + value
        )[type];
      } else {
        data.sectionData.fullURL = generateSocialLink(value)[type];
      }
      dispatch(saveSectionACT(data));
    }
  };

  const handleLink = (e) => {
    e.preventDefault();
    if (validateInput()) {
      updateLink(e.target.value);
    }
  };
  const onUpdateType = (type) => {
    if (props.data.sectionData.type !== type) {
      const data = { ...props.data };
      data.sectionData.type = type;
      if (type !== "link") {
        data.sectionData.pageType = "link";
      }
      dispatch(saveSectionACT(data));
    }
  };

  const updatePageSlug = (e) => {
    if (props.data.sectionData.pageSlug !== pageSlug) {
      const data = { ...props.data };
      data.sectionData.pageSlug = e.target.value;
      data.sectionData.type = pageType;
      dispatch(saveSectionACT(data));
    }
  };

  const updateOpenNewTab = (st) => {
    const data = { ...props.data };
    data.sectionData.openNewTab = st;
    dispatch(saveSectionACT(data));
  };

  useEffect(() => {
    updateLink(props.data.sectionData.url, true);
    if (isPageEnable) {
      setIsPageEnable(false);
    }
  }, [type]);

  const withCapitalType = type[0].toUpperCase() + type.slice(1);

  const handelCountryCode = (e) => {
    const value = e.target.value;
    setCountryPhoneCode(value);
    const data = { ...props.data };
    data.sectionData.countryCode = value;
    data.sectionData.fullURL = generateSocialLink(
      value?.trim() + data.sectionData.url
    )[type];
    dispatch(saveSectionACT(data));
  };

  return (
    <>
      <Type type={type} onType={setType} onUpdateType={onUpdateType} />
      <label>Icons</label>
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div style={{ width: "9%" }}>
          <CustomDropdown
            bgColor={props.bgColor}
            secondaryColor={props.secondaryColor}
            type={type}
            data={props.data}
          />
        </div>
        <div style={{ width: "91%" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateName(e);
            }}
          >
            <div className="pu_input_wrapper" style={{ marginBottom: "0" }}>
              <input
                placeholder="Enter your title"
                id={"el_" + props.data._id}
                className="pu_input"
                defaultValue={
                  props.data.sectionData.title ||
                  props.data.sectionData.linkTitle
                }
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => updateName(e)}
              />
            </div>
          </form>
        </div>
      </div>

      {(type === "link" || type === "page") && (
        <div className="pu_input_wrapper">
          <div className="pu_radio_list">
            <div
              className={
                "pu_radio " + (pageType === "link" ? "pu_active_radio" : "")
              }
              onClick={(e) => typeChangeHandle("link")}
            >
              <label htmlFor={"link_type_link" + props.data._id}>Link</label>
            </div>
            <div
              className={
                "pu_radio " + (pageType === "page" ? "pu_active_radio" : "")
              }
              onClick={(e) => typeChangeHandle("page")}
            >
              <label htmlFor={"link_type_page" + props.data._id}>Page</label>
            </div>
          </div>
        </div>
      )}
      {!isPageEnable ? (
        <>
          <form
            onSubmit={(e) => handleLink(e)}
            style={{ marginBottom: "25px" }}
          >
            <label>Enter Value</label>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              {(type === "phone" || type === "whatsapp") && (
                <div
                  style={{
                    width: "10%",
                    marginBottom: "0",
                  }}
                  className="pu_input_wrapper"
                >
                  <select
                    style={{
                      marginBottom: "0",
                      padding: "10px 1px",
                    }}
                    value={countryPhoneCode}
                    onChange={handelCountryCode}
                    className="pu_input"
                  >
                    <option disabled>Country</option>
                    {countryCodes.map((phoneCode) => (
                      <option value={phoneCode.dial_code}>
                        {phoneCode.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div
                style={{ width: "90%", marginBottom: "0" }}
                className="pu_input_wrapper"
              >
                <input
                  placeholder={placeholder[type]}
                  type={
                    type === "phone" || type === "whatsapp"
                      ? "number"
                      : type === "email"
                      ? "email"
                      : "text"
                  }
                  className="pu_input"
                  defaultValue={props.data.sectionData.url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={(e) => handleLink(e)}
                  style={{
                    borderColor: error ? "red" : "",
                  }}
                />
                {error && (
                  <span
                    style={{
                      color: "red",
                      fontSize: "12px",
                    }}
                  >
                    {error}
                  </span>
                )}
              </div>
            </div>
          </form>
          <div className="pu_input_wrapper">
            <div className="pu_switch">
              <input
                type="checkbox"
                id={"link_open_" + props.data._id}
                defaultChecked={props.data.sectionData.openNewTab}
                onClick={(e) =>
                  updateOpenNewTab(!props.data.sectionData.openNewTab)
                }
              />
              <label htmlFor={"link_open_" + props.data._id}>
                <div className="pu_switch_icon"></div>
                <span className="pu_switch_text">Open in a New Tab </span>
              </label>
            </div>
          </div>
        </>
      ) : null}
      {isPageEnable && type === "link" && (
        <div className="pu_input_wrapper">
          <label>Select Page</label>
          <select
            className="pu_input"
            onBlur={(e) => updatePageSlug(e)}
            defaultValue={props.data.sectionData.pageSlug}
            onChange={(e) => setPageSlug(e.target.value)}
          >
            {props.pages.map((page) => (
              <option key={page._id} value={page.slug}>
                {page.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    pages: state.editor.pages,
  };
};

export default compose(connect(mapStateToProps, null))(Link);
