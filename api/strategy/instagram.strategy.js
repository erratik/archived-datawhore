const space = 'instagram';
const Utils = require('../lib/utils');
const Setting = require('../models/settingModel');
const passport = require('passport')
    , InstagramStrategy = require('passport-instagram').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings(space, (settings) => {

        if (settings.oauth) {
            passport.use(new InstagramStrategy({
                clientID: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                clientSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                callbackURL: `http://datawhore.erratik.ca:10010/auth/${space}/callback`
            },
                (accessToken, refreshToken, profile, done) => Utils.savePassport(settings, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }, profile, done)
            ));
        }

    });

    app.get('/auth/instagram', passport.authenticate(space, {
        scope: ['basic', 'public_content', 'likes', 'comments', 'follower_list', 'relationships']
    }));
    app.get('/auth/instagram/callback', passport.authenticate(space, {
        successRedirect: `http://datawhore.erratik.ca:4200/space/${space}`,
        failureRedirect: 'http://datawhore.erratik.ca:4200'
    }));

};
