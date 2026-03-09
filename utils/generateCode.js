/**
 * generateCode.js
 * ----------------
 * Utility to generate a unique short code for each URL.
 * Uses nanoid v3 (CommonJS compatible) to create a random 7-character
 * alphanumeric string. The custom alphabet avoids ambiguous characters
 * (like 0/O, 1/l) for better readability.
 */

const { customAlphabet } = require('nanoid');

// Custom alphabet: lowercase + uppercase + digits, excluding ambiguous chars
const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Generate a 7-character code — gives ~4 trillion possible combinations
const nanoid = customAlphabet(alphabet, 7);

/**
 * Returns a unique 7-character short code.
 * @returns {string} A random alphanumeric short code
 */
const generateCode = () => nanoid();

module.exports = generateCode;
