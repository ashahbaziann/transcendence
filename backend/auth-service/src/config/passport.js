const passport = require('passport');
const { Strategy: FortyTwoStrategy } = require('passport-42');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

passport.use(new FortyTwoStrategy({
    clientID: process.env.FORTYTWO_CLIENT_ID,
    clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
    callbackURL: process.env.FORTYTWO_CALLBACK_URL
},
async (accessToken, _refreshToken, Profiler, done) => {
    try{
        const existing = await prisma.oAuthAccount.findUnique({
            where: {
                provider_providerId: {
                    provider: '42',
                    providerId: String(Profiler.id)
                }
            }
        });
        if (existing) {
            return done(null, existing);
        }

        const newAccount = await prisma.oAuthAccount.create({
            data: {
                userId: Math.floor(Math.random() * 1000000),
                provider: '42',
                providerId: String(Profiler.id),
                email: Profiler.emails[0].value
            }
        });
        return done(null, newAccount);
    } catch(err) {
        return done(err);
    }
}
));

module.exports = passport;