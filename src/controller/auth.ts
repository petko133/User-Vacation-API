// const { validationResult } = require("express-validator");
// const bcrypt = require("bcryptjs");
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
import { parse, isValid, format } from "date-fns";
import { enGB } from "date-fns/locale/index.js";
// import { enGB } from "date-fns/locale/index.js";

// const User = require("../models/user");
import { User } from "../models/user.js";
import { Vacations } from "../models/vacations.js";
import { Permissions } from "../models/permissions.js";
import { History } from "../models/history.js";

interface IError{
	statusCode?: Number;
}

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "USEREMAIL",
        pass: "rbtyjebdenhharzy",
    },
});

const adminEmail = (name, type, email) => {
    const mailOptions = {
        from: "USEREMAIL",
        to: email,
        subject: "Finish registration process",
        text: `The user: ${name}, has changed something in ${type}`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};

export const signup = async (req, res, next) => {
    try {
        const email = req.body.email;
        const name = req.body.name;
        let birthday = req.body.birthday;
        const location = req.body.location;
        let dateOfJoining = req.body.dateOfJoining;
        const userCheck = await User.findOne({ email: email });
        if (!userCheck) {
            birthday = birthday.split("-");
            dateOfJoining = dateOfJoining.split("-");
            const birthdayDate = new Date(
                birthday[2],
                birthday[1] - 1,
                birthday[0]
            );
            const dateOfJoiningDate = new Date(
                dateOfJoining[2],
                dateOfJoining[1] - 1,
                dateOfJoining[0]
            );
            const token = jwt.sign(
                {
                    email: email,
                },
                "somesupersecretsecret",
                { expiresIn: "1h" }
            );
            const user = new User({
                email: email,
                name: name,
                location: location,
                birthday: birthdayDate,
                dateOfJoining: dateOfJoiningDate,
                authToken: token,
            });
            await user.save();
            const mailOptions = {
                from: "USEREMAIL",
                to: email,
                subject: "User has made Changes",
                text: `Please finish your registration at the following link: http://localhost:8080/auth/password/${token} . This link will expire in 1 hour if not used.`,
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
            res.status(201).json({
                message: "User created!",
                userId: user._id,
                token: token,
            });
        } else {
            const error = new Error("A user with that email already exist!") as IError;
            error.statusCode = 401;
            throw error;
        }
    } catch (err: any) {
		if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("A user with that email can't be found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("The password is incorect!") as IError;
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString(),
            },
            "somesupersecretsecret",
            { expiresIn: "5h" }
        );
        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString(),
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const password = async (req, res, next) => {
    const authToken = req.params.authToken;
    const password = req.body.password;
    const rewritePassword = req.body.rewritePassword;
    try {
        const user = await User.findOne({ authToken: authToken });
		if (!user) {
            const error = new Error("A user with that email can't be found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        if (password !== rewritePassword) {
            const error = new Error("The passwords don't match!") as IError;
            error.statusCode = 401;
            throw error;
        }
        const hashedPass = await bcrypt.hash(password, 12);
        user.password = hashedPass;
        user.authToken = undefined!;
        await user.save();
        res.status(200).json({ message: "Succesfully added a password" });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const profile = async (req, res, next) => {
    const userId = req.userId;
    const email = req.body.email;
    const name = req.body.name;
    let birthday = req.body.birthday;
    const location = req.body.location;
    let vacFrom = req.body.vacFrom;
    let vacTo = req.body.vacTo;
    try {
        const user = await User.findById(userId);
		if (!user) {
            const error = new Error("A user with that email can't be found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        birthday = birthday.split("-");
        const birthdayDate = new Date(
            birthday[2],
            birthday[1] - 1,
            birthday[0]
        );
        vacFrom = vacFrom.split("-");
        vacTo = vacTo.split("-");

        const vacFromDate = parse(
            `${vacFrom[0]}/${vacFrom[1] - 1}/${vacFrom[2]}`,
            "P",
            new Date(),
            {
                locale: enGB,
            }
        );
        const vacToDate = parse(
            `${vacTo[0]}/${vacTo[1] - 1}/${vacTo[2]}`,
            "P",
            new Date(),
            {
                locale: enGB,
            }
        );
        if (!isValid(vacFromDate) || !isValid(vacToDate)) {
            const error = new Error("Invalid Date!") as IError;
            error.statusCode = 401;
            throw error;
        }
        const diffTime = Math.abs(+vacToDate - +vacFromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const vacReq = new Vacations({
            vacFrom: vacFromDate,
            vacTo: vacToDate,
            days: diffDays,
        });
        const populated = await user.populate("vacationReq");
        populated.vacationReq.forEach((request: any) => {
            if (
                request.vacFrom === vacFromDate &&
                request.vacTo === vacToDate
            ) {
                const error = new Error(
                    "That vacation request already exists!"
                ) as IError;
                error.statusCode = 401;
                throw error;
            }
        });
        await vacReq.save();
        user.vacationReq.push(vacReq.id);
        adminEmail(user.name, "Vacation Request", user.email);
        if (user._id.toString() !== userId) {
            const error = new Error("You can't do that.") as IError;
            error.statusCode = 401;
            throw error;
        }
        if (user.email !== email) {
            const checkEmail = await User.findOne({ email: email });
            if (checkEmail) {
                const error = new Error("That email already exist.") as IError;
                error.statusCode = 401;
                throw error;
            }
            user.email = email;
        }
        if (user.name !== name) {
            user.name = name;
        }
        if (+user.birthday !== +birthdayDate) {
        	user.birthday = +birthdayDate;
        }
        if (user.location !== location) {
            user.location = location;
        }
        await user.save();
        res.status(200).json({ message: "Succesfully changed profile." });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    // const userId = req.userId;
    const userBodyId = req.body.userBodyId;
    const email = req.body.email;
    const name = req.body.name;
    let birthday = req.body.birthday;
    const location = req.body.location;
    try {
        const user = await User.findById(userBodyId);
		if (!user) {
            const error = new Error("A user with that email can't be found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        birthday = birthday.split("-");
        const birthdayDate = new Date(
            birthday[2],
            birthday[1] - 1,
            birthday[0]
        );
        if (user.email !== email) {
            const checkEmail = await User.findOne({ email: email });
            if (checkEmail) {
                const error = new Error("That email already exist.") as IError;
                error.statusCode = 401;
                throw error;
            }
            user.email = email;
        }
        if (user.name !== name) {
            user.name = name;
        }
        if (+user.birthday !== +birthdayDate) {
            user.birthday = +birthdayDate;
        }
        if (user.location !== location) {
            user.location = location;
        }
        await user.save();
        res.status(200).json({ message: "Succesfully changed User." });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const userVacations = async (req, res, next) => {
    const userId = req.userId;
    const vacId = req.body.vacId;
    let vacFrom = req.body.vacFrom;
    let vacTo = req.body.vacTo;
    try {
        const user = await User.findById(userId);
		if (!user) {
            const error = new Error("A user with that email can't be found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        vacFrom = vacFrom.split("-");
        vacTo = vacTo.split("-");
        const vacFromDate: any = parse(
            `${vacFrom[0]}/${vacFrom[1] - 1}/${vacFrom[2]}`,
            "P",
            new Date(),
            {
                locale: enGB,
            }
        );
        const vacToDate: any = parse(
            `${vacTo[0]}/${vacTo[1] - 1}/${vacTo[2]}`,
            "P",
            new Date(),
            {
                locale: enGB,
            }
        );
        if (!isValid(vacFromDate) || !isValid(vacToDate)) {
            const error = new Error("Invalid Date!") as IError;
            error.statusCode = 401;
            throw error;
        }
        const diffTime = Math.abs(vacToDate - vacFromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const populated = await user.populate([
            "approvedVac",
            "notApprovedVac",
        ]);
        // console.log(populated);
        for (const vac of populated.approvedVac as any) {
            if (vac._id.toString() === vacId) {
                if (vac.vacFrom !== +vacFromDate || vac.vacTo !== vacToDate) {
                    const vacReq = new Vacations({
                        vacFrom: vacFromDate,
                        vacTo: vacToDate,
                        days: diffDays,
                    });
                    await vacReq.save();
                    const history = new History({
                        before: vac._id,
                        after: vacReq._id,
                        action: "Edit",
                        user: user._id,
                    });
					await history.save()
                    user.vacationReq.push(vacReq._id);
                    user.approvedVac.splice(vac._id.toString(), 1);
                    await user.save();
                    adminEmail(user.name, "Approved Vacations", user.email);
                }
            }
        }
        for (const vac of populated.notApprovedVac as any) {
            if (vac._id.toString() === vacId) {
                if (vac.vacFrom !== +vacFromDate || vac.vacTo !== vacToDate) {
                    const vacReq = new Vacations({
                        vacFrom: vacFromDate,
                        vacTo: vacToDate,
                        days: diffDays,
                    });
                    await vacReq.save();
					const history = new History({
                        before: vac._id,
                        after: vacReq._id,
                        action: "Edit",
                        user: user._id,
                    });
					await history.save()
                    user.vacationReq.push(vacReq._id);
                    user.notApprovedVac.splice(vac._id.toString(), 1);
                    await user.save();
                    adminEmail(user.name, "Not Approved Vacations", user.email);
                }
            }
        }
        for (const vac of populated.vacationReq as any) {
            if (vac._id.toString() === vacId) {
                if (vac.vacFrom !== +vacFromDate || vac.vacTo !== vacToDate) {
                    const vacReq = new Vacations({
                        vacFrom: vacFromDate,
                        vacTo: vacToDate,
                        days: diffDays,
                    });
                    await vacReq.save();
					const history = new History({
                        before: vac._id,
                        after: vacReq._id,
                        action: "Edit",
                        user: user._id,
                    });
					await history.save()
                    user.vacationReq.push(vacReq._id);
                    user.vacationReq.splice(vac._id.toString(), 1);
                    await user.save();
                    adminEmail(user.name, "Vacations Request", user.email);
                }
            }
        }
        res.status(200).json({
            message: "Succesfully changed User.",
            // user: user,
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const deleteVac = async (req, res, next) => {
    const userId = req.userId;
    const vacId = req.body.vacId;
    try {
        const userPopulated = await User.findById(userId).populate([
            "approvedVac",
            "notApprovedVac",
            "vacationReq",
        ]);
		if (!userPopulated) {
            const error = new Error("A user with that email can't be found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        // console.log(userPopulated.approvedVac);
        for (const user of userPopulated.notApprovedVac as any) {
            if (user._id.toString() === vacId) {
                userPopulated.notApprovedVac.splice(user._id.toString(), 1);
                await userPopulated.save();
				const history = new History({
					before: vacId,
					action: "Delete",
					user: userPopulated._id,
				});
				await history.save()
                adminEmail(
                    userPopulated.name,
                    "Not Approved Vacations (Deleted)",
                    userPopulated.email
                );
            }
        }
        for (const user of userPopulated.approvedVac as any) {
            if (user._id.toString() === vacId) {
                userPopulated.approvedVac.splice(user._id.toString(), 1);
                await userPopulated.save();
				const history = new History({
					before: vacId,
					action: "Delete",
					user: userPopulated._id,
				});
				await history.save()
                adminEmail(
                    userPopulated.name,
                    "Approved Vacations (Deleted)",
                    userPopulated.email
                );
            }
        }
        for (const user of userPopulated.vacationReq as any) {
            if (user._id.toString() === vacId) {
                userPopulated.vacationReq.splice(user._id.toString(), 1);
                await userPopulated.save();
				const history = new History({
					before: vacId,
					action: "Delete",
					user: userPopulated._id,
				});
				await history.save()
                adminEmail(
                    userPopulated.name,
                    "Vacation Request (Deleted)",
                    userPopulated.email
                );
            }
        }

        res.status(200).json({
            message: "Succesfully changed User.",
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    const userBodyId = req.body.userBodyId;
    try {
        const user = await User.findByIdAndDelete(userBodyId);
        if (!user) {
            const error = new Error("That User doesn't exist.") as IError;
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({ message: "Succesfully deleted User." });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const forgotPassword = async (req, res, next) => {
    const email = req.body.email;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("That User doesn't exist.") as IError;
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: email,
            },
            "somesupersecretsecret",
            { expiresIn: "1h" }
        );
        const mailOptions = {
            from: "USEREMAIL",
            to: email,
            subject: "Finish registration process",
            text: `Please finish changing password at the following link: http://localhost:8080/auth/change-password/${token} . This link will expire in 1 hour if not used.`,
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        user.authToken = token;
        user.save();
        res.status(201).json({
            email: email,
            token: token,
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const changePassword = async (req, res, next) => {
    // const userId = req.userId;
    const authToken = req.params.authToken;
    const firstPassword = req.body.firstPassword;
    const secondPassword = req.body.secondPassword;
    try {
        const authUser = await User.findOne({ authToken: authToken });
        if (!authUser) {
            const error = new Error(
                "The authentication token has expired please contact the admin for a new one!"
            ) as IError;
            error.statusCode = 401;
            throw error;
        }
        // const user = await User.findById(userId);
        // if (user._id.toString() !== authUser._id.toString()) {
        // 	console.log(authUser, user._id.toString());
        // 	const error = new Error("You can't do that.");
        // 	error.statusCode = 401;
        // 	throw error;
        // }
        if (firstPassword !== secondPassword) {
            const error = new Error("The passwords don't match!") as IError;
            error.statusCode = 401;
            throw error;
        } else {
            const hashedPass = await bcrypt.hash(firstPassword, 12);
            authUser.password = hashedPass;
            authUser.authToken = undefined!;
        }
        await authUser.save();
        res.status(200).json({ message: "Succesfully changed password." });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const allUsers = async (req, res, next) => {
    const allUsers = await User.find().populate("permissions", "name");
    res.status(200).json({
        allUsers: allUsers,
    });
};

export const createPermissions = async (req, res, next) => {
    const userId = req.userId;
    const name = req.body.name;
    const role = req.body.role;
    try {
        const admin = await User.findById(userId);
        console.log(admin);
        const permission = new Permissions({
            name: name,
            role: role,
        });
        await permission.save();
        res.status(200).json({
            message: "Succesfully created permissions.",
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const permissions = async (req, res, next) => {
    const userBodyId = req.body.userBodyId;
    const permissions = req.body.permissions;
    try {
        const user = await User.findById(userBodyId);
        if (!user) {
            const error = new Error("No user found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        const permission = await Permissions.find({ name: permissions });
        permission.forEach((perm) => {
            user.permissions.push(perm._id);
        });
        await user.save();

        res.status(200).json({
            user: user,
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const updatePassword = async (req, res, next) => {
    const userId = req.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    try {
        const user = await User.findById(userId);
		if (!user) {
            const error = new Error("No user found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        if (user._id.toString() !== userId) {
            const error = new Error("You can't do that.") as IError;
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(oldPassword, user.password);
        if (oldPassword === newPassword) {
            const error = new Error("Can't use the same password!") as IError;
            error.statusCode = 401;
            throw error;
        }
        if (!isEqual) {
            const error = new Error("The password is incorect!") as IError;
            error.statusCode = 401;
            throw error;
        } else {
            const hashedPass = await bcrypt.hash(newPassword, 12);
            user.newPassword = hashedPass;
        }
        const token = jwt.sign(
            {
                email: user.email,
            },
            "somesupersecretsecret",
            { expiresIn: "1h" }
        );
        const mailOptions = {
            from: "USEREMAIL",
            to: user.email as string,
            subject: "Finish registration process",
            text: `Please finish changing password at the following link: http://localhost:8080/auth/change-password/${token} . This link will expire in 1 hour if not used.`,
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        user.authToken = token;
        await user.save();
        res.status(201).json({
            email: user.email,
            token: token,
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const savePassword = async (req, res, next) => {
    const userId = req.userId;
    const authToken = req.params.authToken;
    try {
        const user = await User.findById(userId);
        const authUser = await User.findOne({ authToken: authToken });
		if (!user) {
            const error = new Error("No user found!") as IError;
            error.statusCode = 401;
            throw error;
        }
		if (!authUser) {
            const error = new Error("No user found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        if (user._id.toString() !== authUser._id.toString()) {
            const error = new Error("You can't do that.") as IError;
            error.statusCode = 401;
            throw error;
        }
        authUser.password = authUser.newPassword;
        await authUser.save();
        authUser.newPassword = undefined!;
        authUser.authToken = undefined!;
        await authUser.save();
        res.status(201).json({
            message: "Changed Password Success",
            user: authUser,
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const approveVacations = async (req, res, next) => {
    const userBodyId = req.body.userBodyId;
    const approved = req.body.approved;
    const notApproved = req.body.notApproved;
    try {
        const user = await User.findById(userBodyId);
		if (!user) {
            const error = new Error("No user found!") as IError;
            error.statusCode = 401;
            throw error;
        }
        console.log(user);
        approved.forEach((vac) => {
            console.log(vac);
            user.approvedVac.push(vac);
            user.vacationReq.splice(vac, 1);
        });
        notApproved.forEach((vac) => {
            user.notApprovedVac.push(vac);
            user.vacationReq.splice(vac, 1);
        });
        await user.save();
        res.status(201).json({
            message: "Approved",
            user: user,
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
