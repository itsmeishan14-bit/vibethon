/**
 * server.js — Application Entry Point
 * ======================================
 * Sets up the Express server, connects to MongoDB,
 * serves static frontend files, and mounts all routes.
 *
 * Routes:
 *  /api/url/*  — URL shortening API (see routes/url.js)
 *  /:code      — Redirect handler for short URLs
 *  /           — Static frontend (public/ folder)
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Url = require('./models/Url');

const app = express();

// ---- Middleware ----
// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the /public directory
app.use(express.static(path.join(__dirname, 'public')));

// ---- API Routes ----
const { connectDB } = require('./utils/db');
const urlRoutes = require('./routes/url');
app.use('/api/url', urlRoutes);

// ---- Redirect Route ----
const { UrlProvider } = require('./utils/db');

/**
 * GET /:code
 * Looks up the short code in the database.
 * If found, increments the click counter and redirects to the original URL.
 * If not found, returns a 404 error page.
 */
app.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const urlDoc = await UrlProvider.incrementClicks(code);

        if (!urlDoc) {
            return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
        }

        return res.redirect(urlDoc.originalUrl);
    } catch (error) {
        console.error('Redirect error:', error.message);
        return res.status(500).json({ error: 'Server error' });
    }
});

// ---- Database Connection & Server Start ----
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener';

// Initialization function
async function startServer() {
    // Attempt to connect to MongoDB (will fallback to JSON if fails)
    await connectDB(MONGO_URI);

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📂 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
    });
}

startServer();
