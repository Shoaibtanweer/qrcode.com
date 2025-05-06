// --- QR Code Controller ---
// Handles the logic for generating QR codes with customization options.

const QRCode = require('qrcode'); // Library for QR code generation
const path = require('path');
const fs = require('fs'); // Node.js File System module (for file cleanup on error)

// --- Helper Function: Generate QR Data (PNG & SVG) ---
// Takes the data string (text, URL) and options object.
// Returns an object containing { pngDataUrl, svgString }.
const generateQrData = async (dataToEncode, options = {}) => {
    // 1. Define Default QR Generation Options
    const defaultQrOptions = {
        errorCorrectionLevel: 'H', // High error correction (good for logos later, robust)
        margin: 2,                 // Margin around QR code (in modules/dots)
        color: {
            dark: '#000000',       // Default dark color: Black
            light: '#FFFFFF'       // Default light color: White
        },
        width: 300                 // Default width for PNG generation (pixels)
        // scale: 8                // Alternative way to control size, especially for PNG
    };

    // 2. Merge User Options with Defaults
    // Prioritize user options over defaults. Deep merge needed for 'color'.
    const finalOptions = {
        ...defaultQrOptions, // Start with defaults
        ...options,          // Overwrite with user's top-level options (like errorCorrectionLevel, margin)
        color: {
            ...defaultQrOptions.color,    // Start with default colors
            ...(options.color || {})      // Overwrite with user's colors if provided
        }
    };
    // Remove width if scale is provided, as they can conflict in some library versions
    // if (finalOptions.scale && finalOptions.width) {
    //     delete finalOptions.width;
    // }

    console.log("Generating QR with Final Options:", finalOptions); // Log for debugging

    try {
        // 3. Generate QR Code as PNG Data URL
        const pngDataUrl = await QRCode.toDataURL(dataToEncode, {
            ...finalOptions,        // Use merged options
            type: 'image/png'       // Explicitly request PNG format
        });

        // 4. Generate QR Code as SVG String
        // Use QRCode.toString() for SVG. 'width' might be ignored; SVG scales.
        const svgString = await QRCode.toString(dataToEncode, {
            ...finalOptions,        // Use merged options (colors, margin, errorLevel)
            type: 'svg'             // Explicitly request SVG format
        });

        // 5. Return Both Formats
        return {
            pngDataUrl: pngDataUrl,     // Base64 Data URL for PNG
            svgString: svgString        // Raw XML string for SVG
        };
    } catch (err) {
        // Handle errors during QR code generation
        console.error('QR Code generation failed:', err);
        // Throw a new error to be caught by the calling controller function
        throw new Error(`Failed to generate QR code: ${err.message}`);
    }
};


// --- Controller Functions ---

// 1. Handler for Simple Data Types (Text, Number, Link)
// Used by generateTextQR, generateNumberQR, generateLinkQR
const generateSimpleQR = async (req, res, type) => {
    // Extract data and customization options from request body
    // Expected format: { "data": "Your data here", "options": { "color": { ... }, ... } }
    const { data, options } = req.body;

    // --- Basic Input Validation ---
    if (!data && data !== 0) { // Allow 0 for number type
        return res.status(400).json({ message: `Missing 'data' for ${type} QR code.` });
    }
    // Type-specific validation (examples)
    if (type === 'number' && isNaN(data)) {
        return res.status(400).json({ message: `Invalid input: 'data' must be a number.` });
    }
    if (type === 'link') {
        // Basic URL check (can be made more robust)
        // if (!data.toString().startsWith('http://') && !data.toString().startsWith('https://')) {
        //     console.warn("URL doesn't start with http/https:", data);
             // Decide whether to enforce or just warn
             // return res.status(400).json({ message: 'Invalid URL format. Must start with http:// or https://' });
        // }
    }
    // --- End Validation ---

    try {
        // Generate both PNG and SVG using the helper, passing user options
        const qrData = await generateQrData(data.toString(), options || {}); // Ensure data is string, pass options

        // Send successful response with both data types
        res.status(200).json({
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} QR generated successfully!`,
            qrCodeDataUrl: qrData.pngDataUrl, // For PNG preview & download
            qrCodeSvgString: qrData.svgString   // For SVG download
         });
    } catch (error) {
        // Handle errors from generateQrData or other issues
        console.error(`Error generating ${type} QR:`, error);
        res.status(500).json({ message: error.message || `Failed to generate ${type} QR code.` });
    }
};

// Exported Controller Functions for Routes

// Controller for Text QR
exports.generateTextQR = (req, res) => {
    generateSimpleQR(req, res, 'text');
};

// Controller for Number QR
exports.generateNumberQR = (req, res) => {
    generateSimpleQR(req, res, 'number');
};

// Controller for Link QR
exports.generateLinkQR = (req, res) => {
    generateSimpleQR(req, res, 'link');
};


// 2. Handler for File Link QR Codes (PDF, Image)
// 2. Handler for File Link QR Codes (PDF, Image) - UPDATED FOR CLOUDINARY
exports.generateFileLinkQR = async (req, res) => {
    // Check if file was successfully uploaded to Cloudinary by middleware
    // multer-storage-cloudinary populates req.file with 'path' (the secure URL) and 'filename' (the public_id)
    if (!req.file || !req.file.path) { // Check for req.file.path specifically
        console.error("File upload failed or Cloudinary URL missing in req.file:", req.file);
        return res.status(400).json({ message: 'File upload failed. Please try again.' });
    }

    // --- Parse Options from FormData (Keep existing logic) ---
    let options = {};
    if (req.body.options) {
        try { options = JSON.parse(req.body.options); }
        catch (e) {
            console.error("Failed to parse 'options' from FormData:", e);
            // IMPORTANT: If options fail, we should ideally DELETE the file from Cloudinary here!
            // This requires using the Cloudinary API again. For simplicity now, we just return error.
            // Example delete (needs cloudinary instance):
            // if (req.file.filename) { // filename is the public_id
            //    cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.resource_type || 'auto' }, (error, result) => { ... });
            // }
            return res.status(400).json({ message: 'Invalid format for customization options.' });
        }
    }

    // --- Get the Secure URL from Cloudinary (provided by middleware) ---
    const fileUrl = req.file.path; // This IS the public URL from Cloudinary!
    const filePublicId = req.file.filename; // Cloudinary Public ID
    console.log(`File uploaded to Cloudinary: URL=${fileUrl}, PublicID=${filePublicId}`);

    try {
        // Generate QR code for the Cloudinary URL, passing color options
        const qrData = await generateQrData(fileUrl, options); // generateQrData helper remains the same

        res.status(200).json({
            message: 'File link QR generated successfully!',
            qrCodeDataUrl: qrData.pngDataUrl,
            qrCodeSvgString: qrData.svgString,
            fileUrl: fileUrl // Return the Cloudinary URL
        });
    } catch (error) {
        console.error('Error generating file link QR after Cloudinary upload:', error);
        // Again, ideally delete uploaded file from Cloudinary on QR generation error
        // if (filePublicId) { cloudinary.uploader.destroy(filePublicId, ...); }
        res.status(500).json({ message: error.message || 'Failed to generate QR code for the uploaded file link.' });
    }
};
// Potential future controllers for logo upload, specific customizations etc. could go here