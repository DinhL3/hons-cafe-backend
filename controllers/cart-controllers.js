const HttpError = require('../models/http-error');
const Cart = require('../models/cart');
const Drink = require('../models/drink');

const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('drinks.drink');
        if (!cart) {
            return res.status(200).json({ message: 'Cart is empty', cart });
        }
        res.status(200).json({ cart });
    } catch (error) {
        next(new HttpError(error.message, error.status || 500));
    }
};

const addToCart = async (req, res, next) => {
    const { drinkId, quantity } = req.body;
    try {
        const drink = await Drink.findById(drinkId);
        if (!drink) {
            throw new HttpError('Drink not found', 404);
        }
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            const totalDrinkPrice = drink.price * quantity;
            cart = new Cart({
                user: req.user._id,
                drinks: [{ drink: drinkId, quantity, totalDrinkPrice }],
                totalPrice: totalDrinkPrice
            });
        } else {
            const existingDrinkIndex = cart.drinks.findIndex(
                item => item.drink.toString() === drinkId.toString()
            );
            if (existingDrinkIndex !== -1) {
                cart.drinks[existingDrinkIndex].quantity += quantity;
                cart.drinks[existingDrinkIndex].totalDrinkPrice += drink.price * quantity;
            } else {
                const totalDrinkPrice = drink.price * quantity;
                cart.drinks.push({ drink: drinkId, quantity, totalDrinkPrice });
            }
            cart.totalPrice += drink.price * quantity;
        }
        await cart.save();
        res.status(200).json({ message: 'Drink added to cart', cart });
    } catch (error) {
        next(new HttpError(error.message, error.status || 500));
    }
};

const removeItem = async (req, res, next) => {
    const { drinkId } = req.params;
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('drinks.drink');
        if (!cart) {
            throw new HttpError('Cart not found', 404);
        }
        const existingDrinkIndex = cart.drinks.findIndex(
            item => item.drink._id.toString() === drinkId.toString()
        );
        if (existingDrinkIndex === -1) {
            throw new HttpError('Drink not found in cart', 404);
        }
        const removedDrink = cart.drinks.splice(existingDrinkIndex, 1)[0];
        const totalDrinkPrice = removedDrink.quantity * removedDrink.drink.price;
        cart.totalPrice -= totalDrinkPrice;
        await cart.save();
        res.status(200).json({ message: 'Drink removed from cart', cart });
    } catch (error) {
        next(new HttpError(error.message, error.status || 500));
    }
};

const clearCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(200).json({ message: 'Cart is empty', cart });
        }
        cart.drinks = [];
        cart.totalPrice = 0;
        await cart.save();
        res.status(200).json({ message: 'Cart cleared', cart });
    } catch (error) {
        next(new HttpError(error.message, error.status || 500));
    }
};

const increaseQuantity = async (req, res, next) => {
    const { drinkId } = req.params;
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('drinks.drink');
        if (!cart) {
            throw new HttpError('Cart not found', 404);
        }
        const existingDrinkIndex = cart.drinks.findIndex(
            item => item.drink._id.toString() === drinkId.toString()
        );
        if (existingDrinkIndex === -1) {
            throw new HttpError('Drink not found in cart', 404);
        }
        cart.drinks[existingDrinkIndex].quantity++;
        const drink = cart.drinks[existingDrinkIndex].drink;
        cart.totalPrice += drink.price;
        await cart.save();
        res.status(200).json({ message: 'Quantity increased', cart });
    } catch (error) {
        next(new HttpError(error.message, error.status || 500));
    }
};

const decreaseQuantity = async (req, res, next) => {
    const { drinkId } = req.params;
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('drinks.drink');
        if (!cart) {
            throw new HttpError('Cart not found', 404);
        }
        const existingDrinkIndex = cart.drinks.findIndex(
            (item) => item.drink._id.toString() === drinkId.toString()
        );
        if (existingDrinkIndex === -1) {
            throw new HttpError('Drink not found in cart', 404);
        }
        const existingDrink = cart.drinks[existingDrinkIndex];
        if (existingDrink.quantity - 1 <= 0) {
            cart.drinks.splice(existingDrinkIndex, 1);
            cart.totalPrice -= existingDrink.drink.price;
        } else {
            existingDrink.quantity--;
            cart.totalPrice -= existingDrink.drink.price;
        }
        await cart.save();
        res.status(200).json({ message: 'Drink quantity decreased', cart });
    } catch (error) {
        next(new HttpError(error.message, error.status || 500));
    }
};

exports.getCart = getCart;
exports.addToCart = addToCart;
exports.removeItem = removeItem;
exports.clearCart = clearCart;
exports.increaseQuantity = increaseQuantity;
exports.decreaseQuantity = decreaseQuantity;