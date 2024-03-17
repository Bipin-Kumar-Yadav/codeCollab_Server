const express = require('express')

const { register,login,emailVerification,logout} = require('../controllers/auth.controllers')

const router = express.Router();

router.post('/register',register)
router.post('/login',login);
router.post('/email_verification',emailVerification);
router.get('/logout',logout) 
module.exports = router




