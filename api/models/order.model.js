const mongoose = require('mongoose');
const orderLine = require('./orderline.model'); // Import du modèle orderline pour les références

const orderSchema = new mongoose.Schema({
    // customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // Gestion client non demandé dans la description du projet
    empCreated: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    empPrepared: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    empDelivered: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERED'], default: 'PENDING' },
    lines: { type: [mongoose.Schema.Types.ObjectId], ref: 'OrderLine', default: [] },
    total: { type: Number, required: true },
    placeConsume: { type: String, enum: ['DINE-IN', 'TAKEAWAY', 'DELIVERY'], required: true },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
