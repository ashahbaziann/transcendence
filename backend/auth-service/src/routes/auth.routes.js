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

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 2FA
router.get('/2fa/enable', authMiddleware, enable2fa);
router.post('/2fa/verify', authMiddleware, verify2fa);
router.post('/2fa/login', login2fa);
router.get('/2fa/status', authMiddleware, async (req, res) => {
  try {
    const record = await prisma.twoFactorSecret.findUnique({
      where: { userId: req.user.userId }
    });
    res.json({ enabled: !!(record && record.isVerified) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/2fa/disable', authMiddleware, async (req, res) => {
  try {
    await prisma.twoFactorSecret.delete({
      where: { userId: req.user.userId }
    });
    res.json({ disabled: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;