import mongoose, { Schema } from "mongoose";
const permissionsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
});
export const Permissions = mongoose.model("Permissions", permissionsSchema);
