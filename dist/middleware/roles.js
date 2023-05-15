var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../models/user.js";
export const hasRoles = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield User.findById(req.userId);
        if (!user) {
            const error = new Error("A user with that email can't be found!");
            error.statusCode = 401;
            throw error;
        }
        yield user.populate("permissions", "name");
        let namesArray = [];
        user.permissions.forEach((perm) => {
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
    });
};
