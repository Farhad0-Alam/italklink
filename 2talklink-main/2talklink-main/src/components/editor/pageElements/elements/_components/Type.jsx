let linkTypes = [
  {
    value: "link",
    label: "Link",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "sms",
    label: "Text",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
  },
  {
    value: "skype",
    label: "Skype",
  },
  {
    value: "messenger",
    label: "Messenger",
  },
  {
    value: "calender",
    label: "Google Calender",
  },
  {
    value: "facebook",
    label: "Facebook",
  },
  {
    value: "instagram",
    label: "Instagram",
  },
  {
    value: "youtube",
    label: "YouTube",
  },
  {
    value: "tiktok",
    label: "Tik Tok",
  },
  {
    value: "pinterest",
    label: "Pinterest",
  },
  {
    value: "location",
    label: "Address",
  },
];

export default function Type({ type, onType, onUpdateType }) {
  const handleInput = (e) => {
    onType(e.target.value);
    onUpdateType(e.target.value);
  };
  return (
    <>
      <div
        className="pu_input_wrapper"
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <label htmlFor="type">Type</label>
        <select
          onChange={handleInput}
          id="type"
          value={type}
          className="pu_input"
        >
          {linkTypes
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((link) => (
              <option key={link.value} value={link.value}>
                {link.label}
              </option>
            ))}
        </select>
      </div>
    </>
  );
}
