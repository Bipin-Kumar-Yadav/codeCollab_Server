
const express = require('express');
const { verifyToken } = require('../middleware/verifyUser');
const { createCommunity, joinCommunity, getCommunity, myCommunity, deleteCommunity, members } = require('../controllers/community.controllers');
const router = express.Router();

router.post('/create',verifyToken,createCommunity)
router.get('/join/:communityId',verifyToken,joinCommunity)
router.get('/getAllCommunity',getCommunity)
router.get('/myCommunity',verifyToken,myCommunity)    
router.get('/delete/:communityId',verifyToken,deleteCommunity)
router.get('/members/:communityId',members)
module.exports = router