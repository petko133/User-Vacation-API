// const express = require("express");
import express from "express";
// const { body } = require("express-validator");
import { body } from "express-validator";
// const User = require("../models/user");
import { User } from "../models/user.js";
// const authController = require("../controller/auth");
import { signup, login, password, profile, changePassword, permissions, createPermissions, allUsers, updateUser, deleteUser, forgotPassword, savePassword, updatePassword, approveVacations, userVacations, deleteVac, } from "../controller/auth.js";
// const isAuth = require("../middleware/is-auth");
import { isAuth } from "../middleware/is-auth.js";
// const hasRoles = require("../middleware/roles");
import { hasRoles } from "../middleware/roles.js";
export const router = express.Router();
// const router = express.Router();
router.put("/signup", [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject("E-Mail address already exists!");
            }
        });
    })
        .normalizeEmail(),
    body("name").trim().not().isEmpty(),
    body("location").trim().not().isEmpty(),
], isAuth, signup);
router.post("/login", login);
router.patch("/password/:authToken", [
    body("password").trim().isLength({ min: 6, max: 50 }),
    body("rewritePassword").trim().isLength({ min: 6, max: 50 }),
], password);
router.patch("/profile", [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),
    body("name").trim().not().isEmpty(),
    body("location").trim().not().isEmpty(),
], isAuth, profile);
router.get("/users", allUsers);
router.put("/create-permission", isAuth, hasRoles("Admin"), createPermissions);
router.patch("/permissions", isAuth, hasRoles("Admin"), permissions);
router.patch("/update-user", isAuth, hasRoles("Admin"), updateUser);
router.delete("/delete-user", isAuth, hasRoles("Admin"), deleteUser);
router.patch("/approve-vacations", isAuth, hasRoles("Admin"), approveVacations);
router.patch("/user-vacations", isAuth, userVacations);
router.delete("/delete-vacations", isAuth, deleteVac);
router.post("/forgot-password", forgotPassword);
router.patch("/change-password/:authToken", [
    body("oldPassword").trim().isLength({ min: 6, max: 50 }),
    body("newPassword").trim().isLength({ min: 6, max: 50 }),
], changePassword);
router.patch("/update-password", isAuth, updatePassword);
router.patch("/save-password/:authToken", isAuth, savePassword);
// router.patch("/new-link", authController.newLink);
// module.exports = router;
