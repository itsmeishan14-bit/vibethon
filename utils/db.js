/**
 * db.js — Database Abstraction Layer
 * -----------------------------------
 * This module handles the connection to MongoDB and provides
 * a fallback to a local JSON file (data/urls.json) if MongoDB
 * is not available. This ensures the app works out-of-the-box.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'urls.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

let isUsingMongoDB = false;

/**
 * Connect to MongoDB and set the flag.
 * @param {string} uri - MongoDB connection string
 * @returns {Promise<boolean>} Success status
 */
async function connectDB(uri) {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        console.log('✅ Connected to MongoDB');
        isUsingMongoDB = true;
        return true;
    } catch (err) {
        console.error('⚠️ MongoDB connection failed:', err.message);
        console.warn('🚀 Falling back to Local JSON Storage (data/urls.json)');
        isUsingMongoDB = false;
        return false;
    }
}

/**
 * URL Model Interface (Adapter)
 * ------------------------------
 * This object mimics the Mongoose model API but works with both
 * MongoDB and the local JSON file.
 */
const UrlProvider = {
    /** Find all URLs */
    find: async (query = {}) => {
        if (isUsingMongoDB) {
            const Url = require('../models/Url');
            return await Url.find(query).sort({ createdAt: -1 });
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            // Basic sorting for fallback (newest first)
            return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    },

    /** Find one URL by query */
    findOne: async (query) => {
        if (isUsingMongoDB) {
            const Url = require('../models/Url');
            return await Url.findOne(query);
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const key = Object.keys(query)[0];
            const val = query[key];
            return data.find((item) => item[key] === val) || null;
        }
    },

    /** Create and save a new URL entry */
    create: async (urlData) => {
        if (isUsingMongoDB) {
            const Url = require('../models/Url');
            const newUrl = new Url(urlData);
            return await newUrl.save();
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const newEntry = {
                _id: Date.now().toString(),
                clicks: 0,
                createdAt: new Date(),
                ...urlData,
            };
            data.push(newEntry);
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            return newEntry;
        }
    },

    /** Increment click count */
    incrementClicks: async (shortCode) => {
        if (isUsingMongoDB) {
            const Url = require('../models/Url');
            return await Url.findOneAndUpdate(
                { shortCode },
                { $inc: { clicks: 1 } },
                { new: true }
            );
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const index = data.findIndex((item) => item.shortCode === shortCode);
            if (index !== -1) {
                data[index].clicks += 1;
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                return data[index];
            }
            return null;
        }
    },

    /** Delete a URL by ID */
    deleteOne: async (id) => {
        if (isUsingMongoDB) {
            const Url = require('../models/Url');
            return await Url.findByIdAndDelete(id);
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const index = data.findIndex((item) => item._id === id);
            if (index !== -1) {
                const deleted = data.splice(index, 1);
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                return deleted[0];
            }
            return null;
        }
    },

    /** Update a URL by ID */
    updateOne: async (id, updateData) => {
        if (isUsingMongoDB) {
            const Url = require('../models/Url');
            return await Url.findByIdAndUpdate(id, updateData, { new: true });
        } else {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const index = data.findIndex((item) => item._id === id);
            if (index !== -1) {
                data[index] = { ...data[index], ...updateData };
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                return data[index];
            }
            return null;
        }
    },
};

module.exports = { connectDB, UrlProvider, isUsingMongoDB: () => isUsingMongoDB };
