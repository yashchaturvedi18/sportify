const express = require('express');
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const { validateSignUp, validateLogin, validateResult } = require('../middlewares/validator');
const { loginLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

//send html form for creating a new user account

router.get('/new', isGuest, controller.new);

//create a new user account

router.post('/', isGuest,validateSignUp, validateResult, controller.create);

//send html for logging in
router.get('/login', isGuest, controller.getUserLogin);

//authenticate user's login
router.post('/login',loginLimiter, isGuest, validateLogin, validateResult, controller.login);

//send user's profile 
router.get('/profile', isLoggedIn, controller.profile);

//logout
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;