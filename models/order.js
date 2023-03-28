const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    drinks: [{
        drink: { type: Schema.Types.ObjectId, ref: 'Drink' },
        quantity: { type: Number, required: true },
        totalDrinkPrice: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    paypal_order_id: {
        type: String,
        required: true
    },
    shipment: {
        full_name: {
            type: String,
            required: true
        },
        address_line_1: {
            type: String,
            required: true
        },
        admin_area_1: {
            type: String,
            required: true
        },
        admin_area_2: {
            type: String,
            required: true
        },
        country_code: {
            type: String,
            required: true
        },
        postal_code: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        required: true
    },
    created_at: { type: Date, default: Date.now }
});

orderSchema.pre('save', function (next) {
    let totalPrice = 0;
    for (let i = 0; i < this.drinks.length; i++) {
        const drink = this.drinks[i].drink;
        const quantity = this.drinks[i].quantity;
        const price = drink.price;
        const totalDrinkPrice = quantity * price;
        totalPrice += totalDrinkPrice;
        this.drinks[i].totalDrinkPrice = totalDrinkPrice;
    }
    this.totalPrice = totalPrice;
    next();
});


module.exports = mongoose.model('Order', orderSchema);