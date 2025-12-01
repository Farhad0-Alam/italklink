// pages/api/sendEmail.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Set up the transporter with SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT == 465, // Use secure for port 465
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Create email HTML template
    const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2TalkLink - New Contact Form Submission</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #5c6bc0;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header img {
      max-width: 120px; /* Logo size */
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 30px;
      font-weight: bold;
    }
    .header p {
      margin: 5px 0;
      font-size: 16px;
      font-weight: 500;
    }
    .email-content {
      padding: 20px;
    }
    .email-content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 10px 0;
    }
    .email-content p span {
      font-weight: bold;
      color: #5c6bc0;
    }
    
    /* Message Box Styling */
    .message-box {
      background-color: #f4f4f9;
      padding: 15px;
      border-left: 5px solid #5c6bc0;
      margin-top: 15px;
      border-radius: 5px;
    }

    .footer {
      background-color: #f1f1f1;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #888;
    }
    .footer a {
      color: #5c6bc0;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100%;
        padding: 10px;
      }
      .header h1 {
        font-size: 24px;
      }
      .header img {
        max-width: 100px;
      }
    }
  </style>
</head>
<body>

  <div class="email-container">
    <div class="header">
      <img src="https://2talklink.com/images/2TalkLink-Logo.png" alt="2TalkLink Logo">
      <h1>2TalkLink</h1>
      <p>New Contact Form Submission</p>
    </div>

    <div class="email-content">
      <div class="message-box">
        <p><span>Name:</span> ${name}</p>
        <p><span>Email:</span> ${email}</p>
        <p><span>Subject:</span> ${subject}</p>
        <p><span>Message:</span> ${message}</p>
      </div>
    </div>

    <div class="footer">
      <p>You received this message through the contact form on your website.</p>
      <p>For more information, visit <a href="https://www.2talklink.com">2TalkLink</a></p>
    </div>
  </div>

</body>
</html>
`;

    // Send email
    const info = await transporter.sendMail({
      from: '"Support" <contact@2talklink.com>', // Sender address
      to: "rafeuddaraj2@gmail.com", // Admin email
      subject: `New Contact Form Submission: ${subject}`, // Subject
      html: emailTemplate, // HTML content
    });

    console.log("Email sent:", info);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
}
