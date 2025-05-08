// --- Cloudinary Upload Middleware ---
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2; // Use v2
const path = require('path');

// --- Configure Cloudinary SDK ---
// Credentials should be loaded from .env file by dotenv in server.js
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ FATAL ERROR: Cloudinary environment variables (CLOUD_NAME, API_KEY, API_SECRET) are not defined in .env file.");
    // Depending on setup, you might want to exit or throw a blocking error
    // process.exit(1); // Or handle more gracefully
} else {
     cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true // Use https links
    });
    console.log("✅ Cloudinary SDK configured.");
}


// --- Configure Multer Cloudinary Storage Engine ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary, // Use configured cloudinary instance
    params: async (req, file) => {
        // Determine folder and format based on file type or request specifics
        let folderName = 'qr-code-uploads/others'; // Default folder
        let resourceType = 'auto'; // Let Cloudinary detect resource type (image, video, raw for pdf)
        let allowedFormats = ['jpg', 'png', 'jpeg', 'gif', 'webp', 'pdf', 'svg']; // Allowed formats

        const fileExt = path.extname(file.originalname).substring(1).toLowerCase();

        if (['jpg', 'png', 'jpeg', 'gif', 'webp', 'svg'].includes(fileExt)) {
            folderName = 'qr-code-uploads/images';
            resourceType = 'image';
        } else if (fileExt === 'pdf') {
            folderName = 'qr-code-uploads/pdfs';
             // For PDFs, Cloudinary often treats them as 'image' for transformations or 'raw' for direct storage.
             // 'raw' is safer if no transformations needed. 'image' might allow page previews. Let's use 'image' for broader compatibility initially.
            resourceType = 'raw'; // Could also be 'raw'not 'image'
        }

         console.log(`Uploading ${file.originalname} to Cloudinary folder: ${folderName}, resource_type: ${resourceType}`);


        // Params object returned for Cloudinary upload options
        return {
            folder: folderName,           // Folder name in Cloudinary
            // public_id: `qrfile_${Date.now()}`, // Optional: Custom public ID (Cloudinary generates unique one by default)
            resource_type: resourceType,  // Type of file (image, raw, video, auto)
            allowed_formats: allowedFormats // Optional: Server-side format validation
        };
    }
});

// --- File Filter (Optional - Cloudinary storage might handle format check too) ---
// Keep basic MIME type check if needed
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [ 'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Invalid file type. Only PDF, JPG, PNG, GIF, WEBP files are allowed.');
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false);
    }
};

// --- Multer Upload Instance ---
const limits = { fileSize: 15 * 1024 * 1024 }; // 15 MB limit
const upload = multer({
     storage: storage, // Use CloudinaryStorage engine
     fileFilter: fileFilter, // Keep basic filter
     limits: limits
    });

// --- Export Middleware ---
module.exports = upload.single('file'); // Expect 'file' field in FormData
