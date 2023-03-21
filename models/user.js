const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    orders: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Order' }],
    cart: { type: Schema.Types.ObjectId, ref: 'Cart' }
});

module.exports = mongoose.model('User', userSchema);