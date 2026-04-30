const express = require('express');
const { registerUser, loginUser, logoutUser, allUsers, updateUserProfile, firebaseLogin } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

router.route('/').get(protect, allUsers);
router.route('/update').put(protect, upload.single('avatar'), updateUserProfile);
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/firebase-login', firebaseLogin);

module.exports = router;
