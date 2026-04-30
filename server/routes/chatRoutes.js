const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    accessChat,
    fetchChats,
    createGroupChat,
    sendMessage,
    allMessages,
    createCommunity,
    getPublicCommunities,
    joinCommunity,
    banUserFromCommunity,
    checkCommunityName,
    renameChat,
    leaveChat,
    getChatMembers,
    toggleDisappearingMessages,
    blockUser
} = require('../controllers/chatControllers');



const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/send').post(protect, sendMessage);

router.route('/community').post(protect, createCommunity);
router.route('/community/check-name').get(protect, checkCommunityName);
router.route('/communities/public').get(protect, getPublicCommunities);
router.route('/community/join').post(protect, joinCommunity);
router.route('/community/ban').post(protect, banUserFromCommunity);

router.route('/rename').put(protect, renameChat);
router.route('/leave').put(protect, leaveChat);
router.route('/:chatId/members').get(protect, getChatMembers);
router.route('/disappearing-messages').put(protect, toggleDisappearingMessages);
router.route('/block').post(protect, blockUser);



module.exports = router;

