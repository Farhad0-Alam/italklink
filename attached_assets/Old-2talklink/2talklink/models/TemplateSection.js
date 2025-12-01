import mongoose, { Schema, model } from "mongoose";

let refTemp = `${process.env.dbtblPrefix}template`;
let refTempPage = `${process.env.dbtblPrefix}templatePage`;

const templateSectionSchema = new Schema(
  {
    templateId: { type: Schema.Types.ObjectId, ref: refTemp },
    pageId: { type: Schema.Types.ObjectId, ref: refTempPage },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    type: {
      type: String,
      enum: [
        "el_profile",
        "el_heading",
        "el_paragraph",
        "el_link",
        "el_image",
        "el_social_icons",
        "el_gallery",
        "el_qrcode",
        "el_video",
        "el_audio",
        "el_phone",
        "el_contact",
        "el_location",
        "el_accordion",
        "el_image_slider",
        // "el_email",
        // "el_sms",
        // "el_whatsapp",
        // "el_skype",
        // "el_messenger",
        // "el_facebook", "el_instagram", "el_calender", "el_youtube", "el_tiktok", "el_wechat", "el_linkedin", "el_x", "el_snapchat", "el_pinterest"
      ],
      default: "el_heading",
    },
    status: { type: Number, default: 1 },
    isDefault: { type: Number, default: 0 },
    sort: { type: Number, default: 1 },
    sectionData: Object,
    otherBusiness: Array,
    sliderImages: Array,
    animation: Object,
  },
  {
    timestamps: true,
  }
);

templateSectionSchema.index({ title: "text" });
let tName = `${process.env.dbtblPrefix}templateSection`;
const templateSectionModal =
  mongoose.models[tName] || model(tName, templateSectionSchema);
export default templateSectionModal;
