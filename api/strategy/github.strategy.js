const space = 'github';
const Utils = require('../lib/utils');
const Setting = require('../models/settingModel');
const passport = require('passport')
    , GitHubStrategy = require('passport-github').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings(space, (settings) => {
        if (settings.oauth) {
            passport.use(new GitHubStrategy({
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

    app.get(`/auth/${space}`, passport.authenticate(space, { scope: ['default', 'activity', 'location'] }));
    app.get(`/auth/${space}/callback`, passport.authenticate(space, {
        successRedirect: `http://datawhore.erratik.ca:4200/space/${space}`,
        failureRedirect: 'http://datawhore.erratik.ca:4200'
    }));

};
