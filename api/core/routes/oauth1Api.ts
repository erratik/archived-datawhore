let request = require('request');
let https = require('https');
const util = require('util');
const OAuth = require('oauth').OAuth;
let Setting = require('../models/settingModel');


module.exports = function (app) {

    // so far, this one only work for tumblr.. :(
    // Tumblr endpoints
    const authorizeUrl = 'https://www.tumblr.com/oauth/authorize';
    const requestTokenUrl = 'https://www.tumblr.com/oauth/request_token';
    const accessTokenUrl = 'https://www.tumblr.com/oauth/access_token';

    const keys = {
        'tumblr': {
            'key': 'Np70goaQaH27n3n5BrbdENOe5V0IQf9wbVZXT1Ocqop1EULJou',
            'secret': '4Oz4tjYZOCeqcaBbVIiLTaVAaAGF7ajIZCbOgs3JYtSuOjKYCK'
        }
    };

    const oa = new OAuth(
        requestTokenUrl,
        accessTokenUrl,
        keys.tumblr.key,
        keys.tumblr.secret,
        '1.0A',
        'http://datawhore.erratik.ca:10010/api/tumblr/callback',
        'HMAC-SHA1'
    );

    app.get('/api/oauth/middleware', function (req, res) {


            console.log('getOAuthRequestToken tumblr');
            oa.getOAuthRequestToken(function (err, token, secret) {
                if (err) {
                    console.error('\tFailed with error', err);
                    // return next(err);
                }
                console.log('\ttoken %s | secret %s', token, secret);

                // Save generated tokens to session
                req.session.requestToken = token;
                req.session.requestTokenSecret = secret;

                let authUrl = authorizeUrl + '?oauth_token=' + token;
                let html = util.format('<a href="%s">%s</a>', authUrl, authUrl);

                console.log('Direct client to authUrl');
                console.log('\t' + authUrl);
                console.log('\t... waiting for callback');
                // res.;
                return res.redirect(authUrl);
            });


    });
    app.get('/api/tumblr/callback', function (req, res, next) {
        console.log('Received callback');
        console.log('\toauth_token %s | oauth_verifier %s', req.query.oauth_token, req.query.oauth_verifier);
        console.log('\tsession token %s | session secret %s', req.session.requestToken, req.session.requestTokenSecret);

        if (!req.session.requestToken || !req.session.requestTokenSecret) {
            console.error('\tError: Missing session information');
            return next('No previous session info found');
        }

        console.log('getOAuthAccessToken');

        oa.getOAuthAccessToken(
            req.query.oauth_token,
            req.session.requestTokenSecret,
            req.query.oauth_verifier,
            function (err, token, secret) {
                if (err) {
                    console.error('\tValidation failed with error', err);
                    return next('getOAuthAccessToken failed');
                }
                console.log('\ttoken %s | secret %s', token, secret);

                Setting.updateSettings({name: 'tumblr', connected: true, extras: [{label: 'accessToken', value: token, type: 'oauth'}]}, function (settings) {
                    // Setting.findSettings(req.params.space, function (err, space) {
                        console.log('!@#$ settings -> ', settings);
                    //     res.json(space);
                    // });
                    // testOAuthToken(token, secret);
                    res.redirect('http://datawhore.erratik.ca:4200/space/tumblr');
                });
            }
        );
        // const protectedResourceUrl = 'https://api.tumblr.com/v2/blog/developers.tumblr.com/info';

        // function testOAuthToken(token, secret) {
        //     console.log('Test accessToken', protectedResourceUrl);
        //     oa.get(protectedResourceUrl, token, secret, function (err) {
        //         if (err) {
        //             console.error('\tFailed with error', err);
        //             return next('Error testing OAuthToken');
        //         }
        //
        //         console.log('\tVerification successful!');
        //         return res.send(util.format('<strong>Authorization successful!</strong><br>token: %s<br>secret: %s', token, secret));
        //     });
        // }
    });

};
