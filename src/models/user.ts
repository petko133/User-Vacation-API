// const mongoose = require("mongoose");
import mongoose from "mongoose";
import { Types } from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
    email: String;
    password: string;
    newPassword: string;
    name: String;
    birthday: Number;
    location: String;
    dateOfJoining: Number;
    permissions: [Types.ObjectId];
    authToken: String;
    vacationReq: [Types.ObjectId];
    approvedVac: [Types.ObjectId];
    notApprovedVac: [Types.ObjectId];
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        default: "",
    },
    newPassword: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    birthday: {
        type: Number,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    dateOfJoining: {
        type: Number,
        require: false,
    },
    permissions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Permissions",
        },
    ],
    authToken: {
        type: String,
        require: false,
    },
    vacationReq: [
        {
            type: Schema.Types.ObjectId,
            ref: "Vacations",
        },
    ],
    approvedVac: [
        {
            type: Schema.Types.ObjectId,
            ref: "Vacations",
        },
    ],
    notApprovedVac: [
        {
            type: Schema.Types.ObjectId,
            ref: "Vacations",
        },
    ],
});

// module.exports = mongoose.model("User", userSchema);
export const User = mongoose.model<IUser>("User", userSchema);
