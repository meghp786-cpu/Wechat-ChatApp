const express = require('express');
const { allMessages, sendMessage, deleteMessage, editMessage, deleteMessageForEveryone } = require('../controllers/chatControllers');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
        fileUrl,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        fileSize: req.file.size
    });
});

router.route('/:chatId').get(protect, allMessages);
router.route('/:id').delete(protect, deleteMessage); // Delete for Me
router.route('/edit/:id').put(protect, editMessage);
router.route('/delete-everyone/:id').put(protect, deleteMessageForEveryone);
router.route('/').post(protect, sendMessage);

module.exports = router;
