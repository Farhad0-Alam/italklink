import mongoose, { Schema, model } from "mongoose";

const BillingSchema = new Schema(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: "User" },
    invoice_id: String,
    shiping_details: Object,
    validity: Number,
    amount: Number,
    customField: { type: mongoose.Schema.Types.Mixed, default: null },
    title: String,
    paymentStatus: String,
    invoice_url: String,
    paymentMethod: String,
    currency: String,
    couponCode: String,
  },
  {
    timestamps: true,
  }
);

let tName = `${process.env.dbtblPrefix}Billing`;
const BillingModel = mongoose.models[tName] || model(tName, BillingSchema);
export default BillingModel;
