const space = 'twitter';
const Utils = require('../lib/utils');
const Setting = require('../models/settingModel');
const passport = require('passport')
    , TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings(space, (settings) => {

        if (settings.oauth) {
            passport.use(new TwitterStrategy({
                consumerKey: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                consumerSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                callbackURL: `http://datawhore.erratik.ca:10010/auth/${space}/callback`
            },
                (token, tokenSecret, profile, done) => Utils.savePassport(space, settings, {
                    token: token,
                    tokenSecret: tokenSecret
                }, profile, done)
            ));
        }

    });

    app.get('/auth/twitter', passport.authenticate(space));
    app.get('/auth/twitter/callback', passport.authenticate(space, {
        successRedirect: `http://datawhore.erratik.ca:4200/space/${space}`,
        failureRedirect: 'http://datawhore.erratik.ca:4200'
    }));

};
