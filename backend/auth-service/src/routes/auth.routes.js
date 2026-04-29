const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const { oauthCallback } = require('../controllers/oauth.controller');
const passport = require('../config/passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);

//OAuth 42
router.get('/oauth/42', passport.authenticate('42', {session: false}));
router.get('/oauth/42/callback',
    passport.authenticate('42', { session: false, failureRedirect: '/login'}),
    oauthCallback
);

module.exports = router;