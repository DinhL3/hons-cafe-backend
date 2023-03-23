const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    drinks: [{
        drink: { type: Schema.Types.ObjectId, ref: 'Drink' },
        quantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
});

cartSchema.pre('save', function (next) {
    let totalPrice = 0;
    for (let i = 0; i < this.drinks.length; i++) {
        totalPrice += this.drinks[i].price * this.drinks[i].quantity;
    }
    this.totalPrice = totalPrice;
    next();
});

module.exports = mongoose.model('Cart', cartSchema);