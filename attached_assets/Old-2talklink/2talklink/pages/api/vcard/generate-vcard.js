const vCard = require("vcards-js");
const axios = require("axios");

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Extract data from the request body
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      website,
      imageUrl,
      address,
    } = req.body;

    console.log(req?.body, "HEllo");

    // Create a new vCard
    const vcard = vCard();
    // Set properties from the POST request
    vcard.firstName = firstName || "N/A";
    vcard.lastName = lastName || "N/A";
    vcard.cellPhone = phoneNumber;
    vcard.email = email;
    vcard.url = website;
    vcard.homeAddress.label = "Home Address";
    vcard.homeAddress.street = address;

    // Download the image and convert to BASE64
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      // Convert image to BASE64 and determine MIME type from the response headers
      const base64Image = Buffer.from(response.data, "binary").toString(
        "base64"
      );
      const mimeType = response.headers["content-type"];

      // Attach the image in BASE64 format
      vcard.photo.embedFromString(base64Image, mimeType);
    } catch (error) {
      console.error("Error fetching the image:", error);
    }

    // Set content-type and disposition including desired filename
    res.setHeader("Content-Type", 'text/vcard; name="enesser.vcf"');
    res.setHeader("Content-Disposition", 'inline; filename="enesser.vcf"');

    // Send the response
    res.send(vcard.getFormattedString());
  } else {
    // Handle any other HTTP method
    res.status(405).json({ message: "Only POST requests are allowed" });
  }
}
