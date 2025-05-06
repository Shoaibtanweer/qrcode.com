// --- Authentication Controller ---
const User = require('../models/User'); // Import User model
const jwt = require('jsonwebtoken');    // Import JWT library
const { promisify } = require('util');  // Node.js util for promisifying jwt functions if needed

// Helper function to sign JWT token
const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: '90d', // Token expires in 90 days (adjust as needed)
    });
};

// --- Register User ---
exports.register = async (req, res) => {
    try {
        // 1. Get user data from request body
        const { name, email, password } = req.body;

        // 2. Basic Validation (Mongoose schema handles more)
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        // 3. Check if user already exists (Mongoose unique index handles this too, but good to check early)
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists. Please use a different email or login.' });
        }

        // 4. Create new user (password hashing happens via pre-save middleware in User.js)
        const newUser = await User.create({
            name: name,
            email: email,
            password: password,
        });

        // 5. Generate JWT token
        const token = signToken(newUser._id);

        // 6. Send token back to client (don't send password back)
        // newUser.password = undefined; // Not needed due to select: false in schema

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully!',
            token: token,
            // Optionally send back some user data (without password)
            // user: { _id: newUser._id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        // Handle Mongoose validation errors or other errors
        let message = 'Registration failed. Please try again.';
        if (error.code === 11000) { // Duplicate key error (email)
            message = 'Email already exists.';
        } else if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(el => el.message).join('. ');
        }
        res.status(400).json({ message: message, error: error.message }); // Send 400 for client errors
    }
};


// --- Login User ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        // 2. Check if user exists && password is correct
        // Find user by email and explicitly select the password field (which is hidden by default)
        const user = await User.findOne({ email: email }).select('+password');

        // 3. Check if user exists and password is correct using the comparePassword method
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Incorrect email or password.' }); // Use 401 Unauthorized
        }

        // 4. If everything ok, send token to client
        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully!',
            token: token,
             // Optionally send back user data
             // user: { _id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Login failed. Please try again later.', error: error.message });
    }
};

// --- Protect Routes Middleware (Basic Example) ---
// This function can be used as middleware in routes to protect them
exports.protect = async (req, res, next) => {
     try {
        // 1. Getting token and check if it exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // TODO: Also check for token in cookies if using them

        if (!token) {
            return res.status(401).json({ message: 'You are not logged in! Please log in to get access.' });
        }

        // 2. Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3. Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
             return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
        }

        // TODO: 4. Check if user changed password after the token was issued (more secure)

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser; // Attach user to the request object
        next(); // Move to the next middleware/route handler

     } catch (error) {
         console.error("Auth Protect Error:", error);
         let message = 'Authentication failed.';
         if (error.name === 'JsonWebTokenError') message = 'Invalid token. Please log in again.';
         if (error.name === 'TokenExpiredError') message = 'Your session has expired. Please log in again.';
         res.status(401).json({ message: message });
     }
};