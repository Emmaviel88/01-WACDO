const mongoose = require('mongoose');

const orderLineSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu'},
    quantity: { type: Number, required: true },
    price: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.OrderLine || mongoose.model('OrderLine', orderLineSchema);
