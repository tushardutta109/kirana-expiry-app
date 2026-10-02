const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    category: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);