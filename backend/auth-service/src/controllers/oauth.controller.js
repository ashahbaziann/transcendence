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

        // Original response (kept for reference)
        // res.json({ message: 'Login successful', token });

        // Inga change - start
        // Redirect to frontend callback page with token in query param
        return res.redirect(`https://localhost:8443/callback?token=${token}`);
        // Inga change - end

    } catch (err) {
        console.error(err);
        return res.redirect('https://localhost:8443/?error=server_error');
    }
}

module.exports = { oauthCallback };