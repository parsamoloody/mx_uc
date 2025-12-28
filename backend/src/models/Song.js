const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        artist: { type: String, required: true, trim: true },
        album: { type: String, trim: true },
        coverImage: { type: String, required: true },
        category: { type: String, default: 'general' },
        playCount: { type: Number, default: 0 },
        lastPlayed: { type: Date },
        previewUrl: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Song', SongSchema);


