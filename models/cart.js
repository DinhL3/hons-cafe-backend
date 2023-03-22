const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    drinks: [{
        drink: { type: Schema.Types.ObjectId, ref: 'Drink' },
        quantity: { type: Number, required: true }
    }],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    totalPrice: { type: Number, required: true },
});

CartSchema.pre('save', function (next) {
    let totalPrice = 0;
    for (let i = 0; i < this.drinks.length; i++) {
        totalPrice += this.drinks[i].product.price * this.drinks[i].quantity;
    }
    this.totalPrice = totalPrice;
    next();
});

module.exports = mongoose.model('Cart', CartSchema);