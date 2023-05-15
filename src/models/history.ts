import mongoose from "mongoose";
import { Types } from "mongoose";
const Schema = mongoose.Schema;

export interface IHistory{
	before: Types.ObjectId;
	after: Types.ObjectId;
	action: String;
	user: Types.ObjectId;
}

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

export const History = mongoose.model<IHistory>("History", historySchema);
