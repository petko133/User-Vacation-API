import mongoose, { Schema } from "mongoose";

export interface IPermissions {
    name: String;
    role: String;
}

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

export const Permissions = mongoose.model<IPermissions>("Permissions", permissionsSchema);
