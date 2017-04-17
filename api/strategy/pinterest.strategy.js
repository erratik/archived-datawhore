const space = 'pinterest';
const Utils = require('../lib/utils');
const Setting = require('../models/settingModel');
const passport = require('passport')
    , PinterestStrategy = require('passport-pinterest').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings(space, (settings) => {
        if (settings.oauth) {
            passport.use(new PinterestStrategy({
                    clientID: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                    clientSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                    callbackURL: `https://datawhore.erratik.ca:10010/auth/${space}/callback`,
                    scope: ['read_public', 'read_relationships'],
                    state: true
                },
                (accessToken, refreshToken, profile, done) => Utils.savePassport(space, settings, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }, profile, done)
            ));
        }
    });

    app.get('/auth/pinterest', passport.authenticate(space));

    // var forceSsl = function (req, res, next) {
    //     if (req.headers['x-forwarded-proto'] !== 'https') {
    //         return res.redirect(['https://', req.get('Host'), req.url].join(''));
    //     }
    //     return next();
    // };
    //     app.use(forceSsl);

    app.get('/auth/pinterest/callback', passport.authenticate(space, {
        successRedirect: `http://datawhore.erratik.ca:4200/space/${space}`,
        failureRedirect: 'http://datawhore.erratik.ca:4200'
    }));

};
