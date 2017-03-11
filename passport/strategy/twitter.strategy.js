const passport = require('passport')
    , TwitterStrategy = require('passport-twitter').Strategy;
let Setting = require('../models/settingModel');
let Utils = require('../lib/utils');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings('twitter', (settings) => {

        passport.use(new TwitterStrategy({
                consumerKey: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                consumerSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                callbackURL: 'http://datawhore.erratik.ca:10010/auth/twitter/callback'
                // callbackURL: settings.oauth.filter(s => s.keyName === 'redirectUrl')[0].value
            },
            (token, tokenSecret, profile, done) => Utils.savePassport(settings, token, tokenSecret, profile, done)
        ));

    });

    app.get('/auth/twitter', passport.authenticate('twitter', {session: false, scope: []}));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
            successRedirect: 'http://datawhore.erratik.ca:4200/space/twitter',
            failureRedirect: 'http://datawhore.erratik.ca:4200'
        }));

};
