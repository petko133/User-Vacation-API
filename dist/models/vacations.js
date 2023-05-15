import mongoose from "mongoose";
const Schema = mongoose.Schema;
const vacationsSchema = new Schema({
    vacFrom: {
        type: Number,
        require: true,
    },
    vacTo: {
        type: Number,
        require: true,
    },
    days: {
        type: Number,
        require: true,
    },
});
export const Vacations = mongoose.model("Vacations", vacationsSchema);
