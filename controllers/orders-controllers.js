const HttpError = require('../models/http-error');

const Order = require('../models/order');
const Drink = require('../models/drink');
const Cart = require('../models/cart');

const getOrders = async (req, res, next) => {
    let orders;
    try {
        orders = await Order.find({ user: req.user._id });
    } catch (error) {
        next(new HttpError(error.message, error.status || 500));
    }
    res.json({ orders: orders.map(order => order.toObject({ getters: true })) });
};

const getOrderById = async (req, res, next) => {
    const orderId = req.params.orderId;
    let order;

    try {
        order = await Order.findById(orderId).populate('drinks.drink');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find an order.',
            500
        );
        return next(error);
    }

    if (!order) {
        const error = new HttpError(
            'Could not find order for the provided id.',
            404
        );
        return next(error);
    }

    res.status(200).json({ order: order.toObject({ getters: true }) });
}

const saveOrder = async (req, res, next) => {
    const { order } = req.body;
    const orderDetails = order.purchase_units[0];
    try {
        const drinks = orderDetails.items.map((drink) => {
            return {
                drink: drink.sku,
                quantity: Number(drink.quantity),
                totalDrinkPrice: drink.unit_amount.value * drink.quantity,
            };
        });
        const totalPrice = Number(orderDetails.amount.value);
        const shipment = {
            full_name: orderDetails.shipping.name.full_name,
            address_line_1: orderDetails.shipping.address.address_line_1,
            admin_area_1: orderDetails.shipping.address.admin_area_1,
            admin_area_2: orderDetails.shipping.address.admin_area_2,
            country_code: orderDetails.shipping.address.country_code,
            postal_code: orderDetails.shipping.address.postal_code,
        }
        const status = order.status === "COMPLETED" ? "PAID" : "UNPAID";

        const newOrder = new Order({
            user: req.user._id,
            drinks: drinks,
            totalPrice: totalPrice,
            paypal_order_id: order.id,
            shipment: shipment,
            status: status,
        })

        await newOrder.save();
        // clear cart
        let cart = await Cart.findOne({ user: req.user._id });
        cart.drinks = [];
        cart.totalPrice = 0;
        await cart.save();
        res.status(201).json({ message: 'Order saved successful and cart cleared' });
    } catch (error) {
        console.log(error);
        next(new HttpError(error.message, error.status || 500));
    }
};

exports.getOrders = getOrders;
exports.getOrderById = getOrderById;
exports.saveOrder = saveOrder;