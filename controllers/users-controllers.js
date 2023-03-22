const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Cart = require('../models/cart')

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { userName, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'Email already registered, please login instead.',
            422
        );
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(
            'Could not create user, please try again.',
            500
        );
        return next(error);
    }

    const createdUser = new User({
        userName,
        email,
        password: hashedPassword,
        orders: []
    });

    let newCart;
    try {
        newCart = new Cart({
            drinks: [],
            user: createdUser,
            totalPrice: 0
        });
        await newCart.save();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating cart failed, please try again later.',
            500
        );
        return next(error);
    }

    try {
        createdUser.cart = newCart._id;
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    res
        .status(201)
        .json({
            userId: createdUser.id,
            userName: createdUser.userName,
            email: createdUser.email,
            token: token
        });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            403
        );
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError(
            'Could not log you in, please check your credentials and try again.',
            500
        );
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            403
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later.',
            500
        );
        return next(error);
    }

    res.json({
        userId: existingUser.id,
        userName: existingUser.userName,
        email: existingUser.email,
        token: token
    });
};

const getLoggedInUser = async (req, res, next) => {
    // Check if there is an Authorization header with a Bearer token
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return next(new HttpError('Authorization failed, please try logging in again.', 401));
    }

    const token = authHeader.split(' ')[1]; // Split the header value to get the token part
    let decodedToken;

    try {
        // Verify the token with the secret key used to sign it
        decodedToken = jwt.verify(token, 'supersecret_dont_share');
    } catch (err) {
        return next(new HttpError('Authorization failed, please try logging in again.', 401));
    }

    // Extract the user ID from the decoded token
    const userId = decodedToken.userId;

    let existingUser;
    try {
        // Find the user by their ID
        existingUser = await User.findById(userId);
    } catch (err) {
        const error = new HttpError(
            'Fetching user failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('User not found.', 404);
        return next(error);
    }

    res.json({
        userId: existingUser.id,
        userName: existingUser.userName,
        email: existingUser.email,
    });
};

exports.register = register;
exports.login = login;
exports.getLoggedInUser = getLoggedInUser;