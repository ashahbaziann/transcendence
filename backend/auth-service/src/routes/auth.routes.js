const { enable2fa, verify2fa, login2fa } = require('../controllers/twofa.controller');

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


// 2FA
router.get('/2fa/enable', authMiddleware, enable2fa);
router.post('/2fa/verify', authMiddleware, verify2fa);
router.post('/2fa/login', login2fa);

module.exports = router;