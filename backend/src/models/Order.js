const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
        status: { type: String, enum: ['queued', 'playing', 'completed'], default: 'queued' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);