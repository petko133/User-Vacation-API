import mongoose from "mongoose";
const Schema = mongoose.Schema;
const historySchema = new Schema({
    before: {
        type: Schema.Types.ObjectId,
        ref: "Vacations",
    },
    after: {
        type: Schema.Types.ObjectId,
        ref: "Vacations",
    },
    action: {
        type: String,
        require: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});
export const History = mongoose.model("History", historySchema);
