const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../models/users.model");

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(user, done) {
    User.findById(id).then(user => {
        done(null, user)
    })
});

passport.use(new GoogleStrategy({
        clientID: "213857522420-vic878jff422gio44lcspho6b36siqka.apps.googleusercontent.com",
        clientSecret: "npNas58wMsUnA5KlhJmmEvEi",
        callbackURL: "/auth/google/callback"
    },
    async(accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ id: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }

        const user = await new User({
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.name.familyName + ' ' + profile.name.givenName
        }).save();

        done(null, user);
    }
));