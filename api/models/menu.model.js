const mongoose = require('mongoose');

const menuLineSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }
});

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lines: { type: [menuLineSchema], default: [] },
    price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
