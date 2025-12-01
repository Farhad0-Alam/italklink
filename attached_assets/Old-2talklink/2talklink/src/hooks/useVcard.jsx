import axios from "axios";


export default function useVcard(props) {
  const sections = props?.sections || [];
  const nameParts = props.name.trim().split(" ");
  const socialIcons = props?.template?.SocialIconData?.filter((icon) => icon?.status);

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const { imageURL } = props || {};
  const handleVcard = async () => {
    // Initialize vCard data
    // console.log(sections);

    const vcardData = sections.reduce(
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
        vcardData.phoneNumber = value;
      } else if (type === "email" && value) {
        vcardData.email = value;
      } else if (type === "url" && value) {
        vcardData.website = value;
        return;
      }
    });



    try {
      const response = await axios.post(
        `${process.env.API_URL}vcard/generate-vcard`,
        vcardData,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${props.name.trim().toLowerCase().replace(" ", "-")}.vcf`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      // console.error("Error downloading vCard:", error);
    }
  };

  return { handleVcard }
}