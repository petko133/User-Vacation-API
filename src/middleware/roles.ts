// const User = require("../models/user");
import mongoose from "mongoose"
import {User} from "../models/user.js";

interface IError{
	statusCode?: Number;
}

export const hasRoles = (...roles) => {
	return async (req, res, next) => {
		const user = await User.findById(req.userId);
		if (!user) {
            const error = new Error("A user with that email can't be found!") as IError;
            error.statusCode = 401;
            throw error;
        }
		await user.populate("permissions", "name");
		let namesArray: any[] = [];
        user.permissions.forEach((perm: any) => {
			namesArray.push(perm.name);
        });
		const check = roles.every((role) => {
			return namesArray.includes(role);
		});
		if (check !== true) {
			return res
				.status(403)
				.send({ error: { status: 403, message: "Access denied." } });
		}
		next();
	};
};
