const space = 'dribbble';
const Utils = require('../lib/utils');
const Setting = require('../models/settingModel');
const passport = require('passport')
    , DribbbleStrategy = require('passport-dribbble').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = function (app) {

    Setting.findSettings(space, (settings) => {
        settings.space = space;
        if (settings.oauth) {
            passport.use(new DribbbleStrategy({
                clientID: settings.oauth.filter(s => s.keyName === 'apiKey')[0].value,
                clientSecret: settings.oauth.filter(s => s.keyName === 'apiSecret')[0].value,
                callbackURL: `http://datawhore.erratik.ca:10010/auth/${space}/callback`,
                passReqToCallback: true
            },
                (req, accessToken, refreshToken, profile, done) => Utils.savePassport(space, settings, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }, profile, done)
            ));

        }

    });

    app.get(`/auth/dribbble`, passport.authenticate(space, { scope: 'public write comment upload' }));
    app.get(`/auth/dribbble/callback`, passport.authenticate(space, {
        successRedirect: `http://datawhore.erratik.ca:4200/space/${space}`,
        failureRedirect: 'http://datawhore.erratik.ca:4200'
    }));

};
