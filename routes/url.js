/**
 * url.js — API Routes
 * ---------------------
 * Handles all URL-related endpoints:
 *
 *  POST /api/url/shorten  — Create a new shortened URL
 *  GET  /api/url/all      — Retrieve all stored URLs (for dashboard)
 *  GET  /:code            — Redirect to original URL & increment click count
 */

const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const { UrlProvider } = require('../utils/db');
const generateCode = require('../utils/generateCode');

/**
 * POST /api/url/shorten
 * ----------------------
 * Accepts a JSON body with { url: "https://example.com/..." }
 * Validates the URL, generates a unique short code, saves to DB,
 * and returns the shortened URL.
 */
router.post('/shorten', async (req, res) => {
    try {
        const { url } = req.body;

        // --- Validation ---
        // Check if URL is provided
        if (!url || !url.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a URL to shorten.',
            });
        }

        const trimmedUrl = url.trim();

        // Check if URL format is valid (must be a proper HTTP/HTTPS URI)
        if (!validUrl.isWebUri(trimmedUrl)) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid URL (must start with http:// or https://).',
            });
        }

        // --- Check for existing entry ---
        const existingUrl = await UrlProvider.findOne({ originalUrl: trimmedUrl });
        if (existingUrl) {
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            return res.json({
                success: true,
                data: {
                    originalUrl: existingUrl.originalUrl,
                    shortUrl: `${baseUrl}/${existingUrl.shortCode}`,
                    shortCode: existingUrl.shortCode,
                    clicks: existingUrl.clicks,
                    createdAt: existingUrl.createdAt,
                },
            });
        }

        // --- Generate unique short code ---
        let shortCode = generateCode();

        // Ensure the generated code doesn't already exist
        while (await UrlProvider.findOne({ shortCode })) {
            shortCode = generateCode();
        }

        // --- Save to database ---
        const newUrl = await UrlProvider.create({
            originalUrl: trimmedUrl,
            shortCode,
        });

        // --- Build and return the short URL ---
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        return res.status(201).json({
            success: true,
            data: {
                originalUrl: newUrl.originalUrl,
                shortUrl: `${baseUrl}/${newUrl.shortCode}`,
                shortCode: newUrl.shortCode,
                clicks: newUrl.clicks,
                createdAt: newUrl.createdAt,
            },
        });
    } catch (error) {
        console.error('Error shortening URL:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Server error. Please try again later.',
        });
    }
});

/**
 * GET /api/url/all
 * -----------------
 * Returns all stored URLs sorted by creation date (newest first).
 * Used by the dashboard to display analytics.
 */
router.get('/all', async (req, res) => {
    try {
        const urls = await UrlProvider.find();
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

        // Map each URL document to include the full short URL
        const data = urls.map((url) => ({
            id: url._id,
            originalUrl: url.originalUrl,
            shortUrl: `${baseUrl}/${url.shortCode}`,
            shortCode: url.shortCode,
            clicks: url.clicks,
            createdAt: url.createdAt,
        }));

        return res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching URLs:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Server error. Please try again later.',
        });
    }
});

/**
 * PUT /api/url/:id
 * -----------------
 * Update a URL's original link.
 */
router.put('/:id', async (req, res) => {
    try {
        const { url } = req.body;
        const { id } = req.params;

        if (!url || !validUrl.isWebUri(url.trim())) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid URL.',
            });
        }

        const updatedUrl = await UrlProvider.updateOne(id, { originalUrl: url.trim() });

        if (!updatedUrl) {
            return res.status(404).json({ success: false, error: 'Link not found.' });
        }

        return res.json({ success: true, data: updatedUrl });
    } catch (error) {
        console.error('Update error:', error.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

/**
 * DELETE /api/url/:id
 * --------------------
 * Remove a shortened link.
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await UrlProvider.deleteOne(id);

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Link not found.' });
        }

        return res.json({ success: true, message: 'Link deleted successfully.' });
    } catch (error) {
        console.error('Delete error:', error.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

module.exports = router;
