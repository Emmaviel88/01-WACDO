const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    imageUrl: {type: String},
    category: {type: String, enum : ['BEVERAGES', 'VEGIS', 'MEATS', 'DESSERTS'], required: true},
    stock: {type: Number, required: true},
    isOption: {type: Boolean, default: false},
}, {timestamps: true});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);