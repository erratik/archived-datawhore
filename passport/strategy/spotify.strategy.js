const passport = require('passport')
    , SpotifyStrategy = require('passport-spotify').Strategy;
let Setting = require('../models/settingModel');
let Utils = require('../lib/utils');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings('spotify', (settings) => {

        passport.use(new SpotifyStrategy({
                clientID: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                clientSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                callbackURL: 'http://datawhore.erratik.ca:10010/auth/spotify/callback'
                // callbackURL: settings.oauth.filter(s => s.keyName === 'redirectUrl')[0].value
            },
            (token, tokenSecret, profile, done) => Utils.savePassport(settings, token, tokenSecret, profile, done)
        ));

    });
// https://accounts.spotify.com/authorize/?client_id=<apiKey>&response_type=code&redirect_uri=<redirectUrl>&scope=user-read-private user-read-email
    app.get('/auth/spotify', passport.authenticate('spotify', {
        session: false,
        scope: ['user-read-email', 'user-read-private'],
        showDialog: true
    }));
    app.get('/auth/spotify/callback', passport.authenticate('spotify', {
            successRedirect: 'http://datawhore.erratik.ca:4200/space/spotify',
            failureRedirect: 'http://datawhore.erratik.ca:4200'
        }));

};
