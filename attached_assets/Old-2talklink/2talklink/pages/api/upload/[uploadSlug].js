import { authMiddleware } from "../../../lib/authMiddleware";
import {
  Users,
  Templates,
  Campaigns,
  CampaignSection,
  TemplateSection,
  AutoIncrement,
} from "../../../models/DB";
import Common from "../../../helpers/Common";
import { uuid } from "uuidv4";
import md5 from "md5";
import path from "path";
import CommonAPI from "../../../helpers/CommonAPI";
import { parseForm } from "../../../lib/parseForm";

const routeHandler = {};

routeHandler.updateProfile = async (req, res) => {
  let user = req.vsuser;
  try {
    const { fields, files } = await parseForm(req);

    const profileName = fields?.name.toString();
    const profilePassword = fields?.password.toString();

    if (profileName && user) {
      let where = {
        _id: user._id,
      };

      let set = {
        name: profileName,
      };

      let file = "";
      if (files && files?.profileImage) {
        file = files.profileImage[0];
      }
      if (file) {
        let extension = path.extname(file.originalFilename);
        if (!extension) {
          extension = ".png";
        }
        let fileName = uuid().concat(extension);
        const tempFilePath = file.filepath;
        let subPath = `${user._id}`;
        subPath = subPath.concat(`/profileImage`);
        let remoteFile = `usercontent/${subPath}/${fileName}`;

        let r;
        r = await CommonAPI.upload(tempFilePath, remoteFile, {
          ContentType: file.mimetype,
        }).catch((err) => {
          res.json({
            status: "erroe",
            file: null,
            messgae: err,
          });
          return;
        });

        if (r != undefined) {
          if (user.profilePicture && user.profilePicture != "") {
            CommonAPI.deleteObjects([user.profilePicture.key]);
          }
          set.profilePicture = { key: r.url, file: r.data.cdnURL };
        }
      }

      if (profilePassword != "") {
        set.password = md5(profilePassword);
      }

      await Users.updateOne(where, {
        $set: set,
      }).then(() => {
        if (set.password) {
          delete set.password;
        }
        res.json({
          status: "success",
          message: "We have updated profile successfully.",
          data: set,
        });
      });
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.uploadTemplateProfileImage = async (req, res) => {
  let user = req.vsuser;
  try {
    const { fields, files } = await parseForm(req);

    const templateId = fields?.template_id.toString();

    if (templateId != "" && user) {
      let templateTbl = Templates;
      if (user.role != 1) {
        templateTbl = Campaigns;
      }

      let file = "";
      if (files && files?.file) {
        file = files.file[0];
      }
      if (file && file.size) {
        let extension = path.extname(file.originalFilename);
        if (!extension) {
          extension = ".png";
        }
        let fileName = uuid().concat(extension);
        const tempFilePath = file.filepath;
        let subPath = `${user._id}`;
        subPath = subPath.concat(`/templates`);
        let remoteFile = `usercontent/${subPath}/${templateId}/${fileName}`;
        let r;
        r = await CommonAPI.upload(tempFilePath, remoteFile, {
          ContentType: file.mimetype,
        }).catch((err) => {
          res.json({
            status: "error",
            file: null,
            messgae: err,
          });
          return;
        });
        if (r != undefined) {
          let where = { _id: templateId };
          let template = await templateTbl.findOne(where);
          if (template && typeof template._id !== "undefined") {
            let profile = {};
            if (
              template.profile.image &&
              template.profile.image.indexOf("profileImage") === -1
            ) {
              await CommonAPI.deleteObjects([template.profile.image]);
            }
            profile = {
              ...template.profile,
              image: r.url,
            };
            //console.log(profile);
            let set = {
              profile: profile,
            };
            await templateTbl
              .updateOne(where, {
                $set: set,
              })
              .then(() => {
                res.json({
                  status: "success",
                  message:
                    "The template Profile Image has been uploaded successfully.",
                  profile,
                });
              });
          }
        }
      }
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};
async function getNextSequenceValue(sequenceName) {
  console.log({ sequenceName });

  var sequenceDocument = await AutoIncrement.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true }
  );
  // console.log(sequenceDocument);
  return sequenceDocument.sequence_value;
}

routeHandler.addUpdateImageSection = async (req, res) => {
  let user = req.vsuser;
  try {
    const { fields, files } = await parseForm(req);
    let section_id = fields?.section_id.toString();
    let SectionData = fields?.SectionData.toString();
    let imageurl = fields?.url.toString();
    let imageID = "";
    if (fields.imgId) {
      imageID = fields?.imgId.toString();
    }
    if (section_id != "" && user) {
      let sectionTbl = TemplateSection;
      if (user.role != 1) {
        sectionTbl = CampaignSection;
      }

      let file = "";
      if (files && files?.file) {
        file = files.file[0];
      }
      if (file && file.size) {
        let extension = path.extname(file.originalFilename);
        if (!extension) {
          extension = ".png";
        }
        let fileName = uuid().concat(extension);
        const tempFilePath = file.filepath;
        let subPath = `${user._id}`;
        subPath = subPath.concat(`/templates`);
        let remoteFile = `usercontent/${subPath}/${section_id}/${fileName}`;
        let r;
        r = await CommonAPI.upload(tempFilePath, remoteFile, {
          ContentType: file.mimetype,
        }).catch((err) => {
          console.log({ err, name: "Rafe" });

          res.json({
            status: "error",
            file: null,
            messgae: err,
          });
          return;
        });
        if (r != undefined) {
          let where = { _id: section_id };
          let section = await sectionTbl.findOne(where);
          if (section && typeof section._id !== "undefined") {
            let otherBusiness = {};

            if (imageID && imageID !== "") {
              if (section.otherBusiness.length > 0) {
                for (let i = 0; i < section.otherBusiness.length; i++) {
                  if (imageID == section.otherBusiness[i].imageID) {
                    await CommonAPI.deleteObjects([
                      section.otherBusiness[i].image,
                    ]);
                  }
                }
              }
              imageID = JSON.parse(imageID);
              await sectionTbl.updateMany(where, {
                $pull: { otherBusiness: { imageID: imageID } },
              });
            }

            let id = await getNextSequenceValue("imageId");
            otherBusiness = {
              image: r.url,
              url: imageurl,
              imageID: id,
            };
            let set = {
              SectionData: { SectionData },
              otherBusiness: otherBusiness,
            };
            await sectionTbl
              .updateOne(where, {
                $push: set,
              })
              .then((result) => {
                res.json({
                  status: "success",
                  message:
                    "The template Profile Image has been uploaded successfully.",
                  otherBusiness,
                });
              });
          }
        }
      } else if (imageID !== "" && imageurl !== "") {
        imageID = JSON.parse(imageID);
        await sectionTbl
          .updateMany(
            { _id: section_id, "otherBusiness.imageID": imageID },
            { "otherBusiness.$.url": imageurl }
          )
          .then((result) => {
            res.json({
              status: "success",
              message: "The url has been updated successfully.",
              result,
            });
          });
      }
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {

    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.uploadMultipleImages = async (req, res) => {
  let user = req.vsuser;

  try {
    const { files, fields } = await parseForm(req);
    let section_id = fields?.section_id?.toString();
    let sliderImagesFromBody = fields?.sliderImages || null; // Directly use without JSON.parse()

    if (section_id != "" && user) {
      let sectionTbl = TemplateSection;
      if (user.role != 1) {
        sectionTbl = CampaignSection;
      }

      if (sliderImagesFromBody && Array.isArray(sliderImagesFromBody)) {
        let section = await sectionTbl.findOne({ _id: section_id });
        if (section) {
          await sectionTbl.updateOne(
            { _id: section_id },
            { $set: { sliderImages: sliderImagesFromBody } }
          );

          return res.json({
            status: "success",
            message: "Slider images updated successfully.",
            sliderImages: sliderImagesFromBody,
          });
        } else {
          return res.json({
            status: "error",
            message: "Section not found.",
          });
        }
      }

      let imageFiles = files?.file || [];

      if (imageFiles.length === 0) {
        return res.json({
          status: "error",
          message: "No files uploaded.",
        });
      }

      // Create an array of file paths for upload
      let filePaths = imageFiles.map((file) => file.filepath);

      // Upload images to S3
      const uploadResults = await CommonAPI.uploads(
        filePaths,
        `usercontent/${user._id}/templates/${section_id}`,
        {
          ContentType: "image/jpeg",
          ACL: "public-read",
        }
      ).catch((err) => {
        console.log(err);
        return res.json({
          status: "error",
          message: "Failed to upload images.",
        });
      });

      if (uploadResults && uploadResults.length > 0) {
        let section = await sectionTbl.findOne({ _id: section_id });
        if (section) {
          let otherBusinessArray = uploadResults.map((result) => ({
            image: `${process.env.s3URL}${result.url}`,
            id: uuid(),
          }));

          await sectionTbl.updateOne(
            { _id: section_id },
            {
              $set: { sliderImages: otherBusinessArray },
            }
          );

          return res.json({
            status: "success",
            message: "Images uploaded and slider updated successfully.",
            images: otherBusinessArray,
          });
        } else {
          return res.json({
            status: "error",
            message: "Section not found.",
          });
        }
      }
    } else {
      return res.json({
        status: "error",
        message: "User or section ID is missing.",
      });
    }
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error.",
    });
  }
};


routeHandler.deleteMultipleImages = async (req, res) => {
  const {
    fields: { section_id, imageUrls },
  } = await parseForm(req);
  let user = req.vsuser;

  try {
    if (!section_id || !imageUrls || !Array.isArray(imageUrls) || !user) {
      return res.json({
        status: "error",
        message: "Section ID, image URLs or user is missing.",
      });
    }

    // Determine the correct section table based on user role
    let sectionTbl = TemplateSection;
    if (user.role !== 1) {
      sectionTbl = CampaignSection;
    }

    // Fetch section data from the database
    const section = await sectionTbl.findOne({ _id: section_id });

    if (!section) {
      return res.json({
        status: "error",
        message: "Section not found.",
      });
    }

    // Pull the images from sliderImages array using the image URLs
    const result = await sectionTbl.updateOne(
      { _id: section_id },
      {
        $pull: {
          sliderImages: {
            image: { $in: imageUrls },
          },
        },
      }
    );

    // Check if any images were deleted
    if (result.modifiedCount > 0) {
      res.json({
        status: "success",
        message: "Images deleted successfully.",
      });
    } else {
      res.json({
        status: "error",
        message: "No matching images found to delete.",
      });
    }
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error.",
    });
  }
};

routeHandler.deleteImages = async (req, res) => {
  try {
    const {
      fields: { images },
    } = await parseForm(req);

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid input. Please provide an array of remote paths.",
      });
    }

    const result = await CommonAPI.deleteObjects(images);

    res.json({
      status: "success",
      message: `${images.length} images deleted successfully.`,
      result,
    });
  } catch (err) {
    console.error("Error deleting images:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting images.",
    });
  }
};

routeHandler.updateTemplateThumb = async (req, res) => {
  let user = req.vsuser;
  try {
    const { fields, files } = await parseForm(req);

    const templateId = fields?.template_id.toString();

    if (templateId != "" && user) {
      let templateTbl = Templates;

      let where = { _id: templateId };
      let templateData = await templateTbl.findOne(where);
      if (templateData && typeof templateData._id != "undefined") {
        let file = "";
        if (files && files?.thumb) {
          file = files.thumb[0];
        }
        if (file && file.size) {
          let extension = path.extname(file.originalFilename);
          if (!extension) {
            extension = ".png";
          }
          let fileName = uuid().concat(extension);
          const tempFilePath = file.filepath;
          let subPath = `${user._id}`;
          subPath = subPath.concat(`/templates`);
          let remoteFile = `usercontent/${subPath}/${templateId}/${fileName}`;
          let r;
          r = await CommonAPI.upload(tempFilePath, remoteFile, {
            ContentType: file.mimetype,
          }).catch((err) => {
            res.json({
              status: "error",
              file: null,
              messgae: err,
            });
            return;
          });
          if (r != undefined) {
            let thumb = "";
            if (templateData.thumb?.key) {
              await CommonAPI.deleteObjects([templateData.thumb.key]);
            }
            thumb = {
              key: r.url,
              url: r.data.cdnURL,
            };
            let set = {
              thumb: thumb,
            };
            await templateTbl
              .updateOne(where, {
                $set: set,
              })
              .then(() => {
                res.json({
                  status: "success",
                  message:
                    "The template Thumb Image has been uploaded successfully.",
                  data: { thumb: thumb },
                });
              });
          } else {
            res.json({
              status: "error",
              message: "Something went wrong while uploading thumb.",
            });
          }
        } else {
          res.json({
            status: "error",
            message: "Something went wrong.",
          });
        }
      } else {
        res.json({
          status: "error",
          message: "Template that you requested is not exist.",
        });
      }
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

async function handler(req, res) {
  const { uploadSlug } = req.query;
  let routeFlag = true;

  if (req.method === "POST") {
    switch (uploadSlug) {
      case "updateProfile":
        await routeHandler.updateProfile(req, res);
        break;
      case "uploadTemplateProfileImage":
        await routeHandler.uploadTemplateProfileImage(req, res);
        break;
      case "updateTemplateThumb":
        await routeHandler.updateTemplateThumb(req, res);
        break;
      case "addUpdateImageSection":
        await routeHandler.addUpdateImageSection(req, res);
        break;
      case "uploadMultipleImages":
        await routeHandler.uploadMultipleImages(req, res);
        break;
      default:
        routeFlag = false;
    }
  } else if (req.method === "DELETE") {
    switch (uploadSlug) {
      case "deleteImages":
        await routeHandler.deleteImages(req, res);
        break;
      case "deleteMultipleImages":
        await routeHandler.deleteMultipleImages(req, res);
        break;
      default:
        routeFlag = false;
    }
  } else {
    routeFlag = false;
  }

  if (!routeFlag) {
    res.status(404).send("No route found.");
  }
}

export default authMiddleware(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
