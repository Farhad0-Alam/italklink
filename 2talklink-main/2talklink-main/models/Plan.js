import mongoose, { Schema, model } from "mongoose";

// -----> Old Schema
// const planSchema = new Schema(
//   {
//     parentId: { type: Schema.Types.ObjectId, ref: "User" },
//     planname: String,
//     price: Number,
//     validity: Number,
//     source: String,
//     description: String,
//     currency: Object,
//     status: { type: Number, default: 0 },
//   },
//   {
//     timestamps: true,
//   }
// );
// <----- old schema

const planSchema = new Schema(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User" },
    planname: { type: String, required: true },
    selectedModels: [{ type: String, required: true }],
    validity: {
      type: Number,
      required: true,
    },
    currency: {
      code: { type: String, required: true },
      symbol: { type: String, required: true },
    },
    price: { type: Number, required: true },
    numberOfEcard: { type: Number, required: true },
    testDays: { type: Number, default: 0 },
    customSelection: { type: Boolean, default: false },
    customFields: [
      {
        vcard_number: { type: Number, required: true },
        vcard_price: { type: Number, required: true },
      },
    ],
    features: [{ type: Number, required: true }],
    status: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

let tName = `${process.env.dbtblPrefix}Plan`;
const planModel = mongoose.models[tName] || model(tName, planSchema);
export default planModel;
