const jwt = require('jsonwebtoken');

async function oauthCallback(req, res) {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect('https://localhost:8443/?error=oauth_failed');
        }

        const token = jwt.sign(
            { userId: user.userId, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        try {
            await fetch('http://user-service:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.userId,
                    username: user.email.split('@')[0], 
                    email: user.email
                })
            });
        } catch (e) {
            console.error('Failed to create OAuth user profile:', e.message);
        }

        
        try {
            await fetch('http://user-service:3000/users/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.userId, online: true })
            });
        } catch (e) {
            console.error('Failed to set online status:', e.message);
        }
        return res.redirect(`https://localhost:8443/callback?token=${token}`);

    } catch (err) {
        console.error(err);
        return res.redirect('https://localhost:8443/?error=server_error');
    }
}

module.exports = { oauthCallback };