require("dotenv").config();
const secretKey = process.env.SECRET_JWT_KEY;
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            throw new HttpError('Authentication failed', 401);
        }
        const decodedToken = jwt.verify(token, secretKey); // replace with your own secret key
        req.user = { _id: decodedToken.userId };
        next();
    } catch (error) {
        return next(new HttpError(error.message, error.status || 500));
    }
};

module.exports = checkAuth;