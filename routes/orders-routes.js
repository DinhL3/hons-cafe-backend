const express = require('express');
const ordersControllers = require('../controllers/orders-controllers')
const checkAuth = require('../middlewares/check-auth');
const { check } = require('express-validator');
const router = express.Router();

router.get('/', checkAuth, ordersControllers.getOrders);

router.get('/:orderId', checkAuth, ordersControllers.getOrderById)

router.post(
    '/save',
    checkAuth,
    [check('order').not().isEmpty()],
    ordersControllers.saveOrder
);


module.exports = router;