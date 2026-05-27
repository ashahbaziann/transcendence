const { validate } = require('../utils/validator');
const login2faRequestSchema = require('../schemas/login2faRequestSchema');
const login2faVerifyRequestSchema = require('../schemas/login2faVerifyRequestSchema');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function enable2fa(req, res)
{
    try{
        const userId = req.user.userId;

        const secret = speakeasy.generateSecret({
            name: `ft_transcendence:${req.user.email}`
        });
        await prisma.twoFactorSecret.upsert({
            where: {userId},
            update: {secret: secret.base32, isVerified: false},
            create: {userId, secret: secret.base32, isVerified: false}
        });
        const qrSvg = await qrcode.toString(secret.otpauth_url, {type: 'svg'});

        res.json({
            otpauthURL: secret.otpauth_url,
            qrSvg
        });
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



async function verify2fa(req, res){
    try{
        const userId = req.user.userId;
        const { otp } = req.body;

        const errors = validate(login2faVerifyRequestSchema, req.body);
        if (errors) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        const record = await prisma.twoFactorSecret.findUnique({
            where: { userId }
        });
        
        if (!record){
            return res.status(400).json({ error: '2FA not enabled' });
        }

        const isValid = speakeasy.totp.verify({
            secret: record.secret,
            encoding: 'base32',
            token: otp
        });

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        await prisma.twoFactorSecret.update({
            where: { userId },
            data: { isVerified: true }
        });
        res.json({ verified: true });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



async function login2fa(req, res) {
    try{
        const { loginTicket, otp } = req.body;

        const errors = validate(login2faRequestSchema, req.body);
        if (errors) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        const ticket = await prisma.twoFactorTicket.findUnique({
            where: { id: loginTicket }
        });

        if (!ticket || ticket.activated || ticket.expireTime < new Date()) {
            return res.status(401).json({ error: 'Invalid or expired ticket' });
        }

        const record = await prisma.twoFactorSecret.findUnique({
            where: { userId: ticket.userId }
        });
        if (!record){
            return res.status(400).json({ error: '2FA not enabled' });
        }

        const isValid = speakeasy.totp.verify({
            secret: record.secret,
            encoding: 'base32',
            token: otp
        });

        if (!isValid){
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        await prisma.twoFactorTicket.update({
            where: {id: loginTicket },
            data: { activated: true }
        });

        const token = jwt.sign(
            { userId: ticket.userId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: 'Login successful', token });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});

    }
}

module.exports = { enable2fa, verify2fa, login2fa };

