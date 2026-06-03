const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'RECEPTION', 'PREPARATION', 'DELIVERY', 'IDLE']},
}, { timestamps: true });

module.exports = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);