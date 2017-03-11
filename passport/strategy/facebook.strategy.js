const space = 'facebook';
const Utils = require('../lib/utils');
const Setting = require('../models/settingModel');
const passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings('facebook', (settings) => {

        passport.use(new FacebookStrategy({
                clientID: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                clientSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                callbackURL: 'http://datawhore.erratik.ca:10010/auth/facebook/callback',
                profileFields: ['about', 'cover', 'id', 'updated_time', 'picture', 'friends']
                // callbackURL: settings.oauth.filter(s => s.keyName === 'redirectUrl')[0].value
            },
            (accessToken, refreshToken, profile, done) => Utils.savePassport(settings, {
                accessToken: accessToken,
                refreshToken: refreshToken
            }, profile, done)
        ));

    });
// https://accounts.facebook.com/authorize/?client_id=<apiKey>&response_type=code&redirect_uri=<redirectUrl>&scope=user-read-private user-read-email
    app.get('/auth/facebook', passport.authenticate(space));
    app.get('/auth/facebook/callback', passport.authenticate(space, {
        successRedirect: `http://datawhore.erratik.ca:4200/space/${space}`,
        failureRedirect: 'http://datawhore.erratik.ca:4200'
    }));

};
