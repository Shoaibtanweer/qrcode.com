// --- QR Code API Routes ---
// Defines the endpoints for generating different types of QR codes.

const express = require('express');
const qrController = require('../controllers/qrController'); // Import controller functions
const uploadMiddleware = require('../middleware/upload'); // Import file upload middleware

// Create an Express router instance
const router = express.Router();

// --- Define API Endpoints ---

// 1. Endpoint for generating QR code from Text
// Method: POST
// Path: /api/qr/text
// Body: { "data": "Your text", "options": { ... } }
// Controller Function: qrController.generateTextQR
router.post('/text', qrController.generateTextQR);

// 2. Endpoint for generating QR code from Number
// Method: POST
// Path: /api/qr/number
// Body: { "data": 12345, "options": { ... } } // Send number as number or string
// Controller Function: qrController.generateNumberQR
router.post('/number', qrController.generateNumberQR);

// 3. Endpoint for generating QR code from Link/URL
// Method: POST
// Path: /api/qr/link
// Body: { "data": "https://example.com", "options": { ... } }
// Controller Function: qrController.generateLinkQR
router.post('/link', qrController.generateLinkQR);

// 4. Endpoint for generating QR code linking to an uploaded PDF
// Method: POST
// Path: /api/qr/pdf
// Body: FormData with a 'file' field (the PDF) and optionally an 'options' field (JSON string)
// Middleware: uploadMiddleware (handles file saving before controller)
// Controller Function: qrController.generateFileLinkQR
router.post('/pdf', uploadMiddleware, qrController.generateFileLinkQR);
// Note: uploadMiddleware runs first. If successful, req.file is available in qrController.generateFileLinkQR.
// If upload fails (wrong type, size limit), middleware sends error, controller doesn't run.

// 5. Endpoint for generating QR code linking to an uploaded Image
// Method: POST
// Path: /api/qr/image
// Body: FormData with a 'file' field (the Image) and optionally an 'options' field (JSON string)
// Middleware: uploadMiddleware
// Controller Function: qrController.generateFileLinkQR
router.post('/image', uploadMiddleware, qrController.generateFileLinkQR);

// --- (Future routes could be added here) ---
// Example: Route for getting user's saved QR codes, etc.
// router.get('/myqrcodes', authMiddleware, qrController.getUserQrCodes);

// Export the router instance to be used in server.js
module.exports = router;