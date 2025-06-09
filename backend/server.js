// --- Main Backend Server Setup ---

// 1. Import Necessary Modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');    // NEW: For MongoDB
const dotenv = require('dotenv');        // NEW: For .env file

// --- Load Environment Variables ---
dotenv.config({ path: path.join(__dirname, '../.env') }); // Load .env before accessing process.env
console.log("✅ Loaded .env file from:", path.join(__dirname, '../.env'));

// --- sitemap.xml Connection ---
//app.use(express.static(path.join(__dirname, '../public')));

// --- Import Routes ---
const qrRoutes = require('./routes/qrRoutes');
const authRoutes = require('./routes/authRoutes'); // NEW: Auth Routes

// --- Database Connection ---
const DB = process.env.MONGODB_URI;
if (!DB) {
    console.error("❌ FATAL ERROR: MONGODB_URI not defined in .env file.");
    process.exit(1);
}

mongoose.connect(DB)
    .then(() => console.log('✅ Database connection successful!'))
    .catch(err => {
        console.error('❌ Database Connection Error:', err);
        process.exit(1);
    });

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const app = express();

// --- Essential Directories Setup ---
const publicPath = path.join(__dirname, '../public');
const uploadsPath = path.join(__dirname, '../uploads');
const publicImagesPath = path.join(publicPath, 'images');

// Function to Ensure Directory Exists
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Directory created: ${dirPath}`);
        } catch (err) {
            console.error(`❌ Error creating directory '${dirPath}':`, err);
        }
    } else {
        console.log(`📁 Directory already exists: ${dirPath}`);
    }
};

// Create required folders
ensureDirectoryExists(uploadsPath);
ensureDirectoryExists(publicImagesPath);

// --- Core Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static File Serving ---
app.use(express.static(publicPath));          // Serve frontend (public)
//app.use('/uploads', express.static(uploadsPath)); // Serve uploaded files

// --- API Routes ---
app.use('/api/qr', qrRoutes);     // QR Code Routes
app.use('/api/auth', authRoutes); // Authentication Routes
console.log("✅ API routes mounted: /api/qr, /api/auth");

// --- Root Route / SPA Fallback ---
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return next(); // Skip if API or uploads path
    }
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
        if (err) {
            console.error("❌ Error sending index.html:", err);
            res.status(500).send("Error loading application.");
        }
    });
});

// --- Basic Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.stack || err.message || err);

    // Specific Multer Error
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: `File Upload Error: ${err.message}` });
    }
    // Custom error
    if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: err.message });
    }

    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred on the server.'
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`✅ Server listening on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🛢️  Database URI (masked): ${DB ? DB.substring(0, 15) + '...' : 'Not Set'}`);
    console.log(`-------------------------------------------`);
});
