const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const admin = require('../config/firebase');

const generateToken = (id, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, avatar } = req.body;

    if (!firstName || !lastName || !email || !password) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    // Password Validation: 3 Caps, 3 Small, 3 Numbers
    const passwordRegex = /^(?=(.*[A-Z]){3,})(?=(.*[a-z]){3,})(?=(.*[0-9]){3,}).*$/;
    if (!passwordRegex.test(password)) {
        res.status(400);
        throw new Error("Password must contain at least 3 uppercase, 3 lowercase, and 3 numeric characters.");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Generate Username: First + Last + last 4 of email
    let baseUsername = `${firstName}${lastName}${email.split('@')[0].slice(-4)}`.toLowerCase().replace(/\s/g, '');
    let username = baseUsername;
    let usernameExists = await User.findOne({ username });

    if (usernameExists) {
        // Append 3 random digits if exists
        const randomDigits = Math.floor(100 + Math.random() * 900);
        username = `${baseUsername}${randomDigits}`;
    }

    const user = await User.create({
        name: `${firstName} ${lastName}`,
        username,
        email,
        password,
        avatar,
    });

    if (user) {
        generateToken(user._id, res);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(user._id, res);
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { username: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, bio } = req.body;
    let avatar = req.body.avatar;

    // Strict file check as per user request to avoid 500 crashes
    if (!req.file && !avatar && (!name && !bio)) {
        return res.status(400).json({ message: "No file uploaded or data provided" });
    }

    if (req.file) {
        avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio) updateFields.bio = bio;
    if (avatar) updateFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateFields,
        { new: true, runValidators: true }
    );

    if (updatedUser) {
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const firebaseLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        res.status(400);
        throw new Error('No Firebase ID token provided');
    }

    // Verify the Firebase ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    // Find or create user in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
        // Auto-create account for new Google users
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + uid.slice(-4);
        user = await User.create({
            name: name || email.split('@')[0],
            username,
            email,
            password: uid, // placeholder — Google users log in via Firebase only
            avatar: picture || '',
            firebaseUid: uid,
        });
    }

    generateToken(user._id, res);

    res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
    });
});

module.exports = { registerUser, loginUser, logoutUser, allUsers, updateUserProfile, firebaseLogin };
