import mongoose, { Schema, model } from "mongoose";

const settingSchema = new Schema(
	{
		parentId: { type: Schema.Types.ObjectId, ref: "User" },
		stripeKey: String,
		stripeSecret: String,
		isEnabled: Boolean,
		isAdEnabled: Boolean,
		adScript: String,
		adScriptCode: String,
		source: String,
		currency: Object,
		emailSettings: Object,
		status: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	}
);

let tName = `${process.env.dbtblPrefix}AdminSetting`;
const settingModel = mongoose.models[tName] || model(tName, settingSchema);
export default settingModel;
