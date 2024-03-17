
const express = require('express');
const { verifyToken } = require('../middleware/verifyUser');
const { updateProfile } = require('../controllers/profile.controllers');
const router = express.Router();


router.post('/update_profile',verifyToken,updateProfile)

module.exports = router