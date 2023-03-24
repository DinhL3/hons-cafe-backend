const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    drinks: [{
        drink: { type: Schema.Types.ObjectId, ref: 'Drink' },
        quantity: { type: Number, required: true },
        totalDrinkPrice: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
});

cartSchema.pre('save', function (next) {
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

module.exports = mongoose.model('Cart', cartSchema);