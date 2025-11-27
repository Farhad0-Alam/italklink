import sharp from "sharp";

export default async function handler(req, res) {
  const { pathname } = req.headers.referer
    ? new URL(req.headers.referer)
    : { pathname: "/" };

  let datums = null;
  try {
    const response = await fetch(
      `${process.env.API_URL}templates/getTemplates?slug=${pathname.replace(
        "/",
        ""
      )}`
    );
    const data = await response.json();
    datums = data;
  } catch {
    // Error handling (optional)
  }

  let { name, image } = datums || {};
  const manifest = {
    theme_color: "#f6903b",
    background_color: "#f8fafd",
    display: "standalone",
    scope: "/",
    start_url: pathname,
    name: name || "2TalkLink App",
    short_name: name || "2TalkLink",
    description: "Connect and manage all your social links in one place.",
    icons: [],
  };

  if (image) {
    const imageUrl = `${process.env.s3URL}${image}`;
    try {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate different sizes
      const sizes = [192, 256, 384, 512];
      for (const size of sizes) {
        const resizedBuffer = await sharp(buffer)
          .resize(size, size)
          .toFormat("png")
          .toBuffer();

        // Encode image as base64 for inline usage
        const base64Image = `data:image/png;base64,${resizedBuffer.toString(
          "base64"
        )}`;

        manifest.icons.push({
          src: base64Image,
          sizes: `${size}x${size}`,
          type: "image/png",
          purpose: "any maskable",
        });
      }
    } catch (error) {
      console.error("Image processing error:", error);
    }
  } else {
    // Default icons if no image provided
    manifest.icons = [
      {
        src: "/192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ];
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(manifest);
}
