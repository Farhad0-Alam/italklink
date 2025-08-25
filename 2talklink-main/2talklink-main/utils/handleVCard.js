import axios from "axios";

const handleVCard = async (props, name, imageURL) => {
  const sections = props?.sections;
  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const socialIcons = props?.socialIcons?.filter((icon) => icon?.status);
  // Initialize vCard data
  const vCardData = sections.reduce(
    (acc, section) => {
      const data = section.sectionData;

      switch (data.type) {
        case "location":
          acc.location = data.fullURL;
          acc.address = data.url;
          break;
        case "phone":
          acc.phoneNumber = data.url;
          break;
        case "email":
          acc.email = data.url;
          break;
        case "link":
          acc.website = acc.website
            ? `${acc.website} ${data.fullURL}`
            : data.fullURL;
          break;
        case "address":
          acc.address = data.url;
          break;
        default:
          break;
      }
      return acc;
    },
    { firstName, lastName, imageUrl: imageURL }
  );
  socialIcons?.forEach((icon) => {
    const type = icon?.itype;
    const value = icon?.value;
    if (type === "phone" && value) {
      vCardData.phoneNumber = value;
    } else if (type === "email" && value) {
      vCardData.email = value;
    } else if (type === "url" && value) {
      vCardData.website = value;
      return;
    }
  });

  try {
    const response = await axios.post(
      `${process.env.API_URL}/vcard/generate-vcard`,
      vCardData,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${name.trim().toLowerCase().replace(" ", "-")}.vcf`
    );
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Error downloading vCard:", error);
  }
};

export default handleVCard;
