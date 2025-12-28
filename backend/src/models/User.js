const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        membershipType: { type: String, enum: ['Gold', 'Silver', 'Bronze', 'Guest'], default: 'Guest' },
        avatar: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);


