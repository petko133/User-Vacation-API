// const express = require("express");
import express from "express"
// const bodyParser = require("body-parser");
import bodyParser from "body-parser"
// const mongoose = require("mongoose");
import mongoose from "mongoose"

// const authRoutes = require('./routes/auth');
import {router} from "./routes/auth.js"

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
	// res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use('/auth', router);

mongoose
    .connect(
        "MONGODB"
    )
    .then((result) => {
        app.listen(8080);
    })
    .catch((err) => console.log(err));
