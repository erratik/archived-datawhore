const space = 'moves';
const Utils = require('../lib/utils');
const Setting = require('../models/settingModel');
const passport = require('passport')
    , MovesStrategy = require('passport-moves').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings(space, (settings) => {
        if (settings.oauth) {
            const strategy = passport.use(new MovesStrategy({
                clientID: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                clientSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                callbackURL: `http://datawhore.erratik.ca:10010/auth/${space}/callback`
                // callbackURL: settings.oauth.filter(s => s.keyName === 'redirectUrl')[0].value
            },
                (accessToken, refreshToken, profile, done) => Utils.savePassport(settings, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }, profile, done)
            ));
            passport.use(strategy);
            refresh.use(strategy);
        }

    });

    app.get('/auth/${space}', passport.authenticate(space, { scope: ['default', 'activity', 'location'] }));
    app.get('/auth/${space}/callback', passport.authenticate(space, {
        successRedirect: `http://datawhore.erratik.ca:4200/space/${space}`,
        failureRedirect: 'http://datawhore.erratik.ca:4200'
    }));

};
