import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IVacations {
    vacFrom: Number;
    vacTo: Number;
    days: Number;
}

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

export const Vacations = mongoose.model<IVacations>("Vacations", vacationsSchema);
