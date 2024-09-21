// This file contains the configuration for Passport.js, which is used for user authentication.
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('./config');

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            return done(error);
        }
    };

    // Set up the local strategy for authentication
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await User.findOne({ githubId: profile.id });
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = await User.create({ githubId: profile.id, name: profile.displayName || 'GitHub User' });
                    return done(null, newUser);
                }
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}

module.exports = initialize;
