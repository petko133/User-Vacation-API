// const jws = require("jsonwebtoken");
import jws from "jsonwebtoken";
export const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jws.verify(token, "somesupersecretsecret");
    }
    catch (err) {
        if (!decodedToken) {
            const error = new Error("Not authenticated.");
            error.statusCode = 401;
            throw error;
        }
    }
    req.userId = decodedToken.userId;
    next();
};
