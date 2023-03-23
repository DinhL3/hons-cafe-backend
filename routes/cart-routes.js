const express = require('express');
const cartControllers = require('../controllers/cart-controllers')
const checkAuth = require('../middlewares/check-auth');
const { check } = require('express-validator');
const router = express.Router();

router.get('/my-cart', checkAuth, cartControllers.getCart);
router.post(
    '/add-to-cart',
    checkAuth,
    [check('drinkId').not().isEmpty(), check('quantity').isInt({ min: 1 })],
    cartControllers.addToCart
);

// Remove item from cart
router.delete('/:drinkId', checkAuth, cartControllers.removeItem);

// Clear cart
router.delete('/', checkAuth, cartControllers.clearCart);

// Increase drink quantity in cart
router.patch(
    '/increase-quantity/:drinkId',
    checkAuth,
    [check('quantity').isInt({ min: 1 })],
    cartControllers.increaseQuantity
);

// Decrease drink quantity in cart
router.patch(
    '/decrease-quantity/:drinkId',
    checkAuth,
    [check('quantity').isInt({ min: 1 })],
    cartControllers.decreaseQuantity
);

module.exports = router;