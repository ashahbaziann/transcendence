const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validate } = require('../utils/validator');
const loginRequestSchema = require('../schemas/loginRequestSchema');
const registerRequestSchema = require('../schemas/registerRequestSchema');

const prisma = new PrismaClient();

// === РЕГИСТРАЦИЯ ===
async function register(req, res) {
  try {
    const { email, password, username } = req.body;
    const errors = validate(registerRequestSchema, req.body);
    if(errors){
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    const existing = await prisma.localAccount.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.localAccount.create({
      data: {
        userId: Math.floor(Math.random() * 1000000),
        email,
        password: hashedPassword
      }
    });

    //  // Auto-create user profile in user-service
    // await fetch('http://user-service:3000/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     user_id: newUser.userId,
    //     username: username,
    //     email: newUser.email
    //   })
    // });

      const userServiceRes = await fetch('http://user-service:3000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: newUser.userId,
      username: username,
      email: newUser.email
    })
  });
  if (!userServiceRes.ok) {
    console.error('Failed to create user profile:', await userServiceRes.text());
  }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        userId: newUser.userId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// === ЛОГИН ===
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const errors = validate(loginRequestSchema, req.body);
    if (errors) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const user = await prisma.localAccount.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const twofa = await prisma.twoFactorSecret.findUnique({
      where: { userId: user.userId }
    });
    if (twofa && twofa.isVerified){
      const ticket = await prisma.twoFactorTicket.create({
        data: {
          id: require('crypto').randomUUID(),
          userId: user.userId,
          expireTime: new Date(Date.now() + 5 * 60 * 1000)
        }
      });
      return res.json( { requires2fa: true, loginTicket: ticket.id});
    }
    

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Set user online
    try {
      const r = await fetch('http://user-service:3000/users/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.userId, online: true })
      });
      console.log('Online status update:', await r.json());
    } catch (e) {
      console.error('Failed to update online status:', e.message);
    }
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


async function logout(req, res){
  try{
        // Set user offline
    await fetch('http://user-service:3000/users/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: req.user.userId, online: false })
    });
    res.status(200).json({message: 'Logout successful'});
  } catch (err){
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login, logout  };