// --- User Model ---
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true, // Ensure email is unique
        lowercase: true,
        trim: true,
        match: [ // Basic email format validation
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // Do not send password field by default in queries
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// --- Password Hashing Middleware ---
// Hash password BEFORE saving a new user document
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Generate salt & Hash the password with cost factor 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error); // Pass error to the next middleware/handler
    }
});

// --- Instance Method to Compare Passwords ---
// Method to check if the entered password matches the hashed password in the DB
userSchema.methods.comparePassword = async function (candidatePassword) {
    // 'this.password' refers to the hashed password fetched from DB (requires +password in query)
    return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;