import AWS from "aws-sdk";
import fs from "fs";
import nodemailer from "nodemailer";
import mandrillTransport from "nodemailer-mandrill-transport/lib/mandrill-transport";
import nodemailerSendgrid from "nodemailer-sendgrid";
AWS.config = new AWS.Config(process.env.aws.configuration);
const spacesEndpoint = new AWS.Endpoint("s3.amazonaws.com");
const path = require("path");
const uuid = require("uuid").v4;
const s3Object = new AWS.S3({
  endpoint: spacesEndpoint,
});

let defaultOptions = {
  returnFullPath: false,
  ACL: "public-read",
  filename: null,
};

const s3Params = {
  Bucket: process.env.aws.bucket,
};

const CommonAPI = {};

CommonAPI.sendMailUsingMandrill = async (params = null, settings) => {
  return new Promise((resolve, reject) => {
    var transport = nodemailer.createTransport(
      mandrillTransport({
        auth: {
          apiKey: settings.mandrillKey,
        },
      })
    );

    transport.sendMail(
      {
        from: "2TalkLink <contact@2talklink.com>",
        to: params.to,
        subject: params.subject,
        html: params.html,
      },
      function (err, info) {
        if (err) {
          console.error("err", err);
          reject(err);
        } else {
          console.log("info", info);
          resolve(info);
        }
      }
    );
  });
};

CommonAPI.sendMailUsingSMTP = async (params = {}, settings) => {
  try {
    // Ensure the port is a number
    const smtpPort = parseInt(settings.smtpPort, 10);

    // Create a transporter object using the SMTP settings
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465, false for other ports
      auth: {
        user: settings.smtpUsername,
        pass: settings.smtpPassword,
      },
    });

    // Check if 'params' contains required properties
    if (!params.to || !params.subject || !params.html) {
      throw new Error("Missing email parameters: 'to', 'subject', or 'html'.");
    }

    // Send email
    const info = await transporter.sendMail({
      from: "2TalkLink <contact@2talklink.com>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    console.log("Email sent:", info);
    return info;
  } catch (err) {
    console.error("Error in sendMailUsingSMTP:", err);
    throw err;
  }
};

CommonAPI.sendMailUsingSendgrid = async (params = null, settings) => {
  return new Promise((resolve, reject) => {
    let transport = nodemailer.createTransport(
      nodemailerSendgrid({
        apiKey: settings.sendgridKey,
      })
    );
    transport.sendMail(
      {
        from: "2TalkLink <contact@2talklink.com>",
        to: params.to,
        subject: params.subject,
        html: params.html,
      },
      function (err, info) {
        if (err) {
          console.error("err", err);
          reject(err);
        } else {
          console.log("info", info);
          resolve(info);
        }
      }
    );
  });
};

CommonAPI.upload = (localFile, remotePath, options = {}) => {
  options = {
    ...defaultOptions,
    ...options,
  };
  return new Promise((resolve, reject) => {
    let p = Object.assign({}, s3Params);
    p.Key = remotePath;
    p.ACL = options.ACL;
    if (options.ContentType) {
      p.ContentType = options.ContentType;
    }
    // if (options.filename) {
    // 	p.ContentDisposition = `attachment;filename=${options.filename}`;
    // }
    let uploader = new AWS.S3.ManagedUpload({
      params: {
        Body: fs.readFileSync(localFile),
        ...p,
      },
    }).promise();

    uploader.then(
      function (data) {
        fs.unlinkSync(localFile);
        let url = data.Key;
        data.cdnURL = process.env.s3URL.concat(url);
        if (options.returnFullPath) {
          url = bucketBase.concat(url);
        }
        resolve({ url, data });
      },
      function (err) {
        reject(err.toString());
      }
    );
  });
};

// New function for uploading multiple files
CommonAPI.uploads = (localFiles, remotePathPrefix, options = {}) => {
  options = {
    ...defaultOptions,
    ...options,
  };

  return new Promise((resolve, reject) => {
    const uploadPromises = localFiles.map((localFile, index) => {
      const fileExtension = path.extname(localFile); // Get file extension
      const remotePath = `${remotePathPrefix}/${uuid()}-${index}${fileExtension}`; // Generate unique file name

      let p = { ...s3Params, Key: remotePath, ACL: options.ACL };

      if (options.ContentType) {
        p.ContentType = options.ContentType;
      }

      // Upload each file to S3
      const uploader = new AWS.S3.ManagedUpload({
        params: {
          Body: fs.readFileSync(localFile), // Read the file
          ...p,
        },
      }).promise();

      // Return a promise for each file upload
      return uploader.then(
        (data) => {
          fs.unlinkSync(localFile); // Remove the file after uploading
          let url = data.Key;
          data.cdnURL = process.env.s3URL.concat(url); // Set CDN URL
          if (options.returnFullPath) {
            url = bucketBase.concat(url);
          }
          return { url, data }; // Return the URL and data for each file
        },
        (err) => {
          return Promise.reject(err.toString()); // Reject on error
        }
      );
    });

    // Wait for all uploads to complete
    Promise.all(uploadPromises)
      .then((results) => {
        resolve(results); // Resolve with all the results (URLs and data of each file)
      })
      .catch((err) => {
        reject(err); // Reject if any upload fails
      });
  });
};

CommonAPI.deleteObjects = (remotePaths = []) => {
  return new Promise((resolve, reject) => {
    let deleteParams = Object.assign({}, s3Params);

    deleteParams.Delete = { Objects: [] };
    for (let path of remotePaths) {
      deleteParams.Delete.Objects.push({ Key: path });
    }

    s3Object.deleteObjects(deleteParams, async (err, data) => {
      if (err) {
        reject("error while deleting objects from s3" + err);
        console.error("error while deleting objects from s3" + err);
        return;
      }
      resolve(1);
    });
  });
};

CommonAPI.copyObject = async (source, target) => {
  return new Promise(async (resolve, reject) => {
    let params = Object.assign({}, s3Params);
    params.CopySource = s3Params.Bucket + "/" + source;
    params.Key = target;
    params.ACL = defaultOptions.ACL;
    s3Object.copyObject(params, async (err, data) => {
      if (err) {
        reject("error while coping objects from s3" + err);
        console.error("error while coping objects from s3" + err);
        return;
      }
      resolve({ key: target, url: process.env.s3URL + target });
    });
  });
};

CommonAPI.getAllkeysOfFolder = (folder) => {
  return new Promise((resolve, reject) => {
    s3Object?.listObjectsV2(s3Params, function (err, data) {
      console.log({ err: err.message });

      if (
        err &&
        err.message !==
          `User: arn:aws:iam::211125476743:user/nodejs-apps is not authorized to perform: s3:ListBucket on resource: "arn:aws:s3:::ecardurl" with an explicit deny in an identity-based policy`
      )
        reject({ status: 0 });
      if (data?.Contents.length == 0) resolve({ status: 0 });
      let keys = [];
      data?.Contents.forEach(function (content) {
        if (content.Key.indexOf(folder) !== -1) {
          keys.push(content.Key);
        }
      });
      if (keys.length) resolve({ status: 1, keys: keys });
      else resolve({ status: 0 });
    });
  });
};

export default CommonAPI;
