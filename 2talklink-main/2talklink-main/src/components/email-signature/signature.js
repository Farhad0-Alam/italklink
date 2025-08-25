const generateSignature = (
  data = {
    name: "",
    image: "",
    location: "",
    locationUrl: "",
    phone: "",
    phoneLink: "",
    email: "",
    website: "",
    cardUrl: "",
    tiktok: "",
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    tagLine: "",
    color: "",
  },
  isPreview = false
) => {
  const color = data?.color;
  const callIcon = `${process.env.APP_URL}signature/Phone.png`;
  const emailIcon = `${process.env.APP_URL}signature/Email.png`;
  const locationIcon = `${process.env.APP_URL}signature/Location.png`;
  const eCardIcon = `${process.env.APP_URL}signature/vcard.png`;
  const websiteIcon = `${process.env.APP_URL}signature/Website.png`;

  const signatureString = `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sanchez:ital@0;1&display=swap" rel="stylesheet">
  </head>
  
  <body style="background-color: #FFFFFF; color: #000000; margin: 0; padding: 0;">
      ${!isPreview ? `<a href="${data.cardUrl}" target="_blank">` : ""}
      <table width="100%" border="0" cellspacing="0" cellpadding="0" class="main01"
      style="border-collapse: collapse; margin: 0; border:none; padding:0;">
      <tbody>
        <tr>
          <td valign="top" style="border:none;">
            <table width="${
              isPreview ? "100%" : "400"
            }" border="0" cellspacing="0" cellpadding="0" align="left"
              style="max-width:${
                isPreview ? "100%" : "400px"
              };border-collapse: collapse; margin: 0; border:none; padding:0;">
              <tbody>
                <!-- Info Part -->
                <tr>
                  <td valign="top" align="left" style="border:none;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0"
                      style="border-collapse: collapse; margin: 0; border:none; padding:0;">
                      <tbody>
                        <tr>
                          ${
                            data.image
                              ? `<td valign="top" width="110" align="center"
                            style="line-height:1px; margin:0px;border:none;">
                            <img src="${data.image}" alt="${data.name}" width="140" height="142"
                              style="border:none; width:140px; height:142px;">
                          </td>`
                              : ""
                          }
                          <td width="10" style="font-size:1px; line-height:1px;border:none;" valign="top">&nbsp;</td>
                          <td valign="top" align="left" style="line-height: 1px;">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%"
                              style="border-collapse: collapse; margin: 0;">
                              <tbody>
                                <tr>
                                  <td align="left" valign="top" style="border:none;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                      style="text-align:left;border-collapse: collapse; margin: 0;">
                                      <tbody>
                                        <!-- Name & Title -->
                                        ${
                                          data.name
                                            ? `<tr>
                                          <td colspan="2" valign="top" align="left"
                                            style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica, 'sans-serif'; font-size:13pt; line-height:110%; color:${color}; text-align:left; border:none; border-bottom: 1px dashed ${color}; padding-bottom: 5px;">
                                            <strong>${data.name}</strong> <br>
                                            ${
                                              data.tagLine
                                                ? `<span
                                              style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica, 'sans-serif'; font-size:9.5pt;color:#000000;border: none;">${data.tagLine}</span>`
                                                : ""
                                            }
                                          </td>
                                        </tr>`
                                            : ""
                                        }
                                        <!-- Call -->
                                        ${
                                          data.phone || data.phoneLink
                                            ? `<tr>
                                          <td colspan="2" height="10" style="font-size:1px; line-height:1px;border:none;">
                                          </td>
                                        </tr>
                                        <tr>
                                          <td width="22" style="line-height:1px;border:none;">
                                            <span style="display:inline-block;background-color:${color};">
                                            <img src="${callIcon}" alt="icon" style="border:none; width:13px; height:13px;">
                                            </span>
                                          </td>
                                          <td valign="middle" align="left"
                                            style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica, 'sans-serif'; font-size:9pt; line-height:100%; color:#000000; text-align:left; font-weight:normal;border:none;">
                                            <a href="tel:${data.phoneLink}" target="_blank"
                                              style="color:#000000; text-decoration:none !important; font-size:9pt;">${data.phone}</a>
                                          </td>
                                        </tr>`
                                            : ""
                                        }
                                        <!-- Email -->
                                        ${
                                          data.email
                                            ? `<tr>
                                          <td colspan="2" height="6" style="font-size:0pt; line-height:1px;border:none;">
                                          </td>
                                        </tr>
                                        <tr>
                                          <td width="22" valign="middle" style="line-height:1px;border:none;">
                                          <span style="display:inline-block;background-color:${color};">
                                            <img style="background:${color};" src="${emailIcon}" alt="icon" width="13"
                                              height="13" style="border:none; width:13px; height:13px;">
                                            </span>
                                          </td>
                                          <td valign="middle" align="left"
                                            style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica, 'sans-serif'; font-size:9pt; line-height:120%; color:#000000; text-align:left; font-weight:normal;border:none;">
                                            <a href="mailto:${data.email}" target="_blank"
                                              style="color:#000000; text-decoration:none !important; font-size:9pt;">${data.email}</a>
                                          </td>
                                        </tr>`
                                            : ""
                                        }
                                        <!-- Website -->
                                        ${
                                          data.website
                                            ? `<tr>
                                          <td colspan="2" height="6" style="font-size:0pt; line-height:1px;border:none;">
                                          </td>
                                        </tr>
                                        <tr>
                                          <td width="22" valign="top" style="line-height:1px;border:none;">
                                          <span style="display:inline-block;background-color:${color};">
                                          <img style="background:${color};" src="${websiteIcon}" alt="icon" width="13"
                                            height="13" style="border:none; width:13px; height:13px;">
                                            </span>
                                          </td>
                                          <td valign="middle" align="left"
                                            style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica, 'sans-serif'; font-size:9pt; line-height:120%; color:#000000; text-align:left; font-weight:normal;border:none;">
                                            <a href="${data.website}" target="_blank"
                                              style="color:#000000; text-decoration:none !important; font-size:9pt;">${data.website}</a>
                                          </td>
                                        </tr>`
                                            : ""
                                        }
                                        <!-- Location -->
                                        ${
                                          data.location
                                            ? `<tr>
                                          <td colspan="2" height="6" style="font-size:0pt; line-height:1px;border:none;">
                                          </td>
                                        </tr>
                                        <tr>
                                          <td width="22" valign="top" style="line-height:1px;border:none;">
                                          <span style="display:inline-block;background-color:${color};">
                                            <img style="background:${color};" src="${locationIcon}" alt="icon" width="13"
                                              height="13" style="border:none; width:13px; height:13px;">
                                            </span>
                                          </td>
                                          <td valign="middle" align="left"
                                            style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica, 'sans-serif'; font-size:9pt; line-height:120%; color:#000000; text-align:left; font-weight:normal;border:none;">
                                            <a href="${data.locationUrl}" target="_blank"
                                              style="color:#000000; text-decoration:none !important; font-size:9pt;">${data.location}</a>
                                          </td>
                                        </tr>`
                                            : ""
                                        }
                                        <!-- Digital Business Card -->
                                        ${
                                          data.cardUrl
                                            ? `<tr>
                                          <td colspan="2" height="6" style="font-size:0pt; line-height:1px;border:none;">
                                          </td>
                                        </tr>
                                        <tr>
                                          <td width="22" valign="top" style="line-height:1px;border:none;">
                                          <span style="display:inline-block;background-color:${color};">
                                          <img style="background-color:${color};" src="${eCardIcon}" width="13"
                                            height="13" style="border:none; width:13px; height:13px;">
                                            </span>
                                          </td>
                                          <td valign="middle" align="left"
                                            style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica, 'sans-serif'; font-size:9pt; line-height:120%; color:#000000; text-align:left; font-weight:normal;border:none;">
                                            <a href="${data.cardUrl}" target="_blank"
                                              style="color:#000000; text-decoration:none !important; font-size:9pt;">Digital
                                              Business Card</a>
                                          </td>
                                        </tr>`
                                            : ""
                                        }
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <!-- Banner Part -->
                <tr>
                  <td colspan="2" height="10" style="font-size:0pt; line-height:1px;border:none;"></td>
                </tr>
                <tr>
                  <td valign="middle" align="left" bgcolor="#00B050"
                    style="line-height: 1px; background-color: ${color}; padding: 8px; border: 1px solid ${color};">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0"></table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" height="10" style="font-size:0pt; line-height:1px;border:none;"></td>
                </tr>
                <tr>
                  <td valign="middle" align="left" style="line-height: 1px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td valign="middle" align="left" style="line-height: 1px;">
                            <p style="line-height: 1px; padding: 0px; margin: 0px 0px 0px 0px;">
                              ${
                                data.facebook
                                  ? `<a href="${data.facebook}" target="_blank"><img
                                  src="https://arifmahamud.com/imghost/1946-Q-md_farhad_alam/facebook.png" alt="icon" width="20"
                                  height="20" style="border:none; width:20px; height:20px;"></a>&nbsp;`
                                  : ""
                              }
                              ${
                                data.instagram
                                  ? `<a href="${data.instagram}" target="_blank"><img
                                  src="https://arifmahamud.com/imghost/1946-Q-md_farhad_alam/instagram.png" alt="icon" width="20"
                                  height="20" style="border:none; width:20px; height:20px;"></a>&nbsp;`
                                  : ""
                              }
                              ${
                                data.twitter
                                  ? `<a href="${data.twitter}" target="_blank"><img
                                  src="https://arifmahamud.com/imghost/1946-Q-md_farhad_alam/twitter.png" alt="icon" width="20"
                                  height="20" style="border:none; width:20px; height:20px;"></a>&nbsp;`
                                  : ""
                              }
                              ${
                                data.youtube
                                  ? `<a href="${data.youtube}" target="_blank"><img
                                  src="https://arifmahamud.com/imghost/1946-Q-md_farhad_alam/youtube.png" alt="icon" width="20"
                                  height="20" style="border:none; width:20px; height:20px;"></a>&nbsp;`
                                  : ""
                              }
                              ${
                                data.linkedin
                                  ? `<a href="${data.linkedin}" target="_blank"><img
                                  src="https://eco-cards.com/wp-content/uploads/2024/06/li.png" alt="icon" width="20"
                                  height="20" style="border:none; width:20px; height:20px;"></a>&nbsp;`
                                  : ""
                              }
                              ${
                                data.tiktok
                                  ? `<a href="${data.tiktok}" target="_blank"><img
                                  src="https://eco-cards.com/wp-content/uploads/2024/06/tiktok.png" alt="icon" width="20"
                                  height="20" style="border:none; width:20px; height:20px;"></a>`
                                  : ""
                              }
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="middle" align="left" height="5" style="font-size: 1px; line-height: 1px;"></td>
                </tr>
                <tr>
                  <td valign="top" align="justify" width="420"
                    style="font-family: Arial, Gotham, 'Helvetica Neue', Helvetica,  'sans-serif';  font-size:9pt; line-height:120%; color:#808080; text-align:justify; font-weight:normal;">
                    The content of this message is confidential. If you have received it by mistake, please
                    inform us and then delete the message. It is forbidden to copy, forward, or in any way
                    reveal the contents of this message to anyone. The integrity and security of this email
                    cannot be guaranteed. Therefore, the sender will not be held liable for any damage caused
                    by the message.
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
     ${!isPreview ? ` </a>` : ""}
  </body>
  
  </html>`;

  return signatureString;
};

export default generateSignature;
