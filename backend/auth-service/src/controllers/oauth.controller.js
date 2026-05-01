const jwt = require('jsonwebtoken');

async function oauthCallback(req, res) {
    try{
        const user = req.user;

        const token = jwt.sign(
                { userId: user.userId, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
        );
        res.json({ message: 'Login successful', token  });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { oauthCallback };