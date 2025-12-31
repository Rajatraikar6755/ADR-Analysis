const { createWorker } = require('tesseract.js');
const logger = require('./logger');

/**
 * Performs OCR on a buffer (image).
 * @param {Buffer} buffer The image buffer.
 * @returns {Promise<string>} The extracted text.
 */
async function performOCR(buffer) {
    try {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(buffer);
        await worker.terminate();
        return text;
    } catch (error) {
        logger.error('OCR Utility Error:', error);
        throw error;
    }
}

module.exports = { performOCR };
