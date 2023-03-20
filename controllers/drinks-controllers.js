const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Drink = require('../models/drink');

const getDrinks = async (req, res, next) => {
    let drinks;
    try {
        drinks = await Drink.find({});
    } catch (err) {
        const error = new HttpError(
            'Fetching drinks failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({ drinks: drinks.map(drink => drink.toObject({ getters: true })) });
};

const getDrinksByCategory = async (req, res, next) => {
    let category = req.params.category;
    let drinks;

    try {
        drinks = await Drink.find({ category: category }).exec();
    } catch (err) {
        const error = new HttpError(
            'Fetching drinks failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({ drinks: drinks.map(drink => drink.toObject({ getters: true })) });
};

exports.getDrinks = getDrinks;
exports.getDrinksByCategory = getDrinksByCategory;