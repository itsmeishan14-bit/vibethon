/**
 * Url.js — Mongoose Model
 * -------------------------
 * Defines the schema for shortened URLs stored in MongoDB.
 *
 * Fields:
 *  - originalUrl : The full original URL the user wants to shorten
 *  - shortCode   : The unique 7-char code used in the short URL
 *  - clicks      : Number of times the short URL has been visited
 *  - createdAt   : Timestamp when the short URL was created
 */

const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    // The original long URL submitted by the user
    originalUrl: {
        type: String,
        required: [true, 'Original URL is required'],
    },

    // Unique short code (e.g., "aBc4567") — indexed for fast lookups
    shortCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    // Click counter — incremented each time the short URL is visited
    clicks: {
        type: Number,
        default: 0,
    },

    // Auto-set creation timestamp
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Url', urlSchema);
