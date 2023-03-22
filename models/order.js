const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    orderNumber: {
        type: Number,
        unique: true,
        required: true,
        min: 1000000,
        max: 9999999,
        default: Math.floor(1000000 + Math.random() * 9000000) // Generates a random 7-digit number
    },
    drinks: [{
        drink: { type: Schema.Types.ObjectId, ref: 'Drink' },
        quantity: { type: Number, required: true }
    }],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    totalPrice: { type: Number, required: true },
    payment: {
        paymentID: {
            type: String,
            required: true
        },
        payerID: {
            type: String,
            required: true
        }
    },
    shipment: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    created_at: { type: Date, default: Date.now }
});

OrderSchema.pre('save', function (next) {
    let totalPrice = 0;
    for (let i = 0; i < this.drinks.length; i++) {
        totalPrice += this.drinks[i].product.price * this.drinks[i].quantity;
    }
    this.totalPrice = totalPrice;
    next();
});

module.exports = mongoose.model('Order', OrderSchema);