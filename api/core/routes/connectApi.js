var Config = require('../models/spaceModel');

var mongoose = require('mongoose');
// var oauthSignature = require('oauth-signature');


// expose the routes to our app with module.exports
module.exports = function (app) {


    app.get('/api/connect/twitter/middle', function (req, res) {
        res.send(req);
    });

    app.get('/api/connect/:namespace/:key/:secret', function (req, res) {

        var that = this;
        //if (req.params.namespace == 'callback') res.send();
        console.log('[API CONNECT] ' + req.params.namespace);

        Config.findByName(req.params.namespace, function (err, config) {

            var oauth = config[0].settings.oauth;

            switch (req.params.namespace) {
                case 'twitter':

                    res.redirect('/api/callback/' + req.params.namespace);

                    break;
                case 'swarm':

                    var credentials = {
                        secrets: {
                            redirectUrl: oauth.redirect_uri.value,
                            clientId: oauth.api_key.value,
                            clientSecret: oauth.api_secret.value
                        }
                    };
                    var foursquare = require('node-foursquare')(credentials);
                    res.redirect(foursquare.getAuthClientRedirectUrl());

                    break;
                case 'instagram':

                    var api = require('instagram-node').instagram();
                    api.use({
                        client_id: oauth.api_key.value,
                        client_secret: oauth.api_secret.value
                    });
                    var redirect_uri = oauth.redirect_uri.value;
                    res.send(api.get_authorization_url(redirect_uri, {scope: ['basic'], state: 'authed-basic'}));

                    break;
                case 'facebook':

                    var graph = require('fbgraph');
                    var authUrl = graph.getOauthUrl({
                        "client_id": oauth.api_key.value
                        , "redirect_uri": oauth.redirect_uri.value
                    });

                    // shows dialog
                    res.send(authUrl);


                    break;
                case 'spotify':
                    var SpotifyWebApi = require('spotify-web-api-node');

                    var scopes = ['user-read-private', 'user-read-email'],
                        redirectUri = config[0].settings.oauth.redirect_uri.value + '/middle',
                        clientId = config[0].settings.oauth.api_key.value,
                        state = 'authed';

                    // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
                    var spotifyApi = new SpotifyWebApi({
                        redirectUri: redirectUri,
                        clientId: clientId
                    });

                    // Create the authorization URL
                    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
                    res.send(authorizeURL);

                    break;

                case 'lastfm':
                   /* var LastFmNode = require('lastfm').LastFmNode;
                    var LastFmSession = require('../../../../node_modules/lastfm/lib/lastfm/lastfm-session');

                    var lastfm = new LastFmNode({
                        api_key:  oauth.api_key.value,    // sign-up for a key at http://www.last.fm/api
                        secret:  oauth.api_secret.value
                    });

                    lastfm.request("auth.getToken", {
                        handlers: {
                            success: function(data) {
                                // console.log("Success: " + data);
                                // console.log(data);
                                res.send('http://www.last.fm/api/auth?api_key='+oauth.api_key.value+'&'+data.token);

                                // var session = lastfm.session({
                                //     token: data.token,
                                //     user: 'djladylux',
                                //         handlers: {
                                //             success: function(data){
                                //                 console.log(data)
                                //             },
                                //             error: function(error) {
                                //                 console.log("Error: " + error.message);
                                //             }
                                //         }
                                //
                                // });

                                // session.on('success', function (someting) {
                                //     console.log(someting);
                                // });
                                // session.on('error', function (someting) {
                                //     console.log(someting);
                                // });

                                console.log(session);
                                // lastfm.request("auth.getSession", {
                                //     signed: true,
                                //     handlers: {
                                //         success: function(data){
                                //             console.log(data)
                                //         },
                                //         error: function(error) {
                                //             console.log("Error: " + error.message);
                                //         }
                                //     }
                                // });

                            },
                            error: function(error) {
                                console.log("Error: " + error.message);
                            }
                        },
                        signed: true
                    });

                    // console.log(request());

*/
                    var LastfmAPI = require('lastfmapi');

                    // Create a new instance
                    var lfm = new LastfmAPI({
                        api_key:  oauth.api_key.value,    // sign-up for a key at http://www.last.fm/api
                        secret:  oauth.api_secret.value
                    });

                    lfm.auth.getToken(function(err, token){
                        console.log(err, token);
                        res.send(lfm.getAuthenticationUrl(oauth.redirect_uri.value, token));

                    });

                    // lfm.getAuthenticationUrl(params)

                    break;
                case 'tumblr':
                    /*
                     var passport = require('passport-tumblr');
                     passport.use(new TumblrStrategy({
                     consumerKey: oauth.api_key.value,
                     consumerSecret: oauth.api_secret.value,
                     callbackURL: oauth.redirect_uri.value
                     },
                     function(token, tokenSecret, profile, done) {
                     User.findOrCreate({ tumblrId: profile.id }, function (err, user) {
                     return done(err, user);
                     });
                     }
                     ));*/
                    //passport.authenticate('tumblr');
                    res.redirect('/api/callback/' + req.params.namespace);
                    break;
                case 'moves':

                    var Moves = require('moves');
                    var moves = new Moves({
                        client_id: oauth.api_key.value,
                        client_secret: oauth.api_secret.value,
                        redirect_uri: oauth.redirect_uri.value
                    });
                    var authorizeURL = moves.authorize({
                        scope: ['activity', 'location'] //can contain either activity, location or both
                        , state: 'authed' //optional state as per oauth
                    });

                    res.send(authorizeURL);
                    break;
                case 'fitbit':

                    var FitbitApiClient = require("fitbit-node");
                    var fitbitApi = new FitbitApiClient({
                        clientID: oauth.api_key.value,
                        clientSecret: oauth.api_secret.value

                    });
                    var authorizeURL = fitbitApi.getAuthorizeUrl({
                        scope: ['activity', 'heartrate', 'location', 'nutrition', 'profile', 'settings', 'sleep', 'social', 'weight']
                        , redirectUri: oauth.redirect_uri.value //optional state as per oauth
                    });

                    res.send(authorizeURL);
                    break;
                default:

            }
        });


        //console.log(req.body);
        //console.log('>> /@end');
    });
    app.get('/api/callback/:namespace/:bounce?', function (req, res) {

        console.log('[API CONNECT CALLBACK] ' + req.params.namespace);


        Config.findByName(req.params.namespace, function (err, config) {

            //console.log(config);
            var oauth = config[0].settings.oauth;
            var _config = new Config({name: req.params.namespace}); // instantiated Space

            _config.connect(function () {

                switch (req.params.namespace) {
                    case 'twitter':
                        res.redirect('/#/');
                        break;
                    case 'tumblr':

                        var passport = require('passport-tumblr');
                        passport.use(new TumblrStrategy({
                                consumerKey: oauth.api_key.value,
                                consumerSecret: oauth.api_secret.value,
                                callbackURL: oauth.redirect_uri.value
                            }, function (token, tokenSecret, profile, done) {
                                User.findOrCreate({tumblrId: profile.id}, function (err, user) {
                                    return done(err, user);
                                });
                            }
                        ));

                        passport.authenticate('tumblr', {failureRedirect: '/login'}, function (req, res) {
                                // Successful authentication, redirect home.
                                res.redirect('/');
                            });
                        break;
                    case 'swarm':

                        var credentials = {
                            secrets: {
                                redirectUrl: oauth.redirect_uri.value,
                                clientId: oauth.api_key.value,
                                clientSecret: oauth.api_secret.value
                            }
                        };
                        var foursquare = require('node-foursquare')(credentials);
                        foursquare.getAccessToken({
                                code: req.query.code
                            },
                            function (error, access_token) {
                                if (error) {
                                    res.send('An error was thrown: ' + error.message);
                                }
                                else {
                                    // Save the accessToken and redirect.
                                    console.log('Yay! Access token is ' + access_token);
                                    oauth.access_token = {
                                        value: access_token,
                                        label: 'Access Token'
                                    };

                                    _config.updateSpace({
                                        data: oauth,
                                        type: 'settings.oauth'
                                    }, function () {
                                        res.redirect('/#/');
                                    });
                                }
                            });

                        break;

                    case 'instagram':
                        console.log(config);

                        var api = require('instagram-node').instagram();
                        api.use({
                            client_id: oauth.api_key.value,
                            client_secret: oauth.api_secret.value
                        });
                        console.log(req.query.code);
                        api.authorize_user(req.query.code, oauth.redirect_uri.value,
                            function (err, result) {
                                if (err) {
                                    console.log(err.body);
                                    res.send("Didn't work");
                                } else {
                                    console.log('Yay! Access token is ' + result.access_token);
                                    oauth.access_token = {
                                        value: result.access_token,
                                        label: 'Access Token'
                                    };

                                    _config.updateSpace({
                                        data: oauth,
                                        type: 'settings.oauth'
                                    }, function () {
                                        res.redirect('/#/');
                                    });
                                }
                            });

                        break;
                    case 'facebook':

                        var graph = require('fbgraph');
                        // after user click, auth `code` will be set
                        // we'll send that and get the access token
                        graph.authorize({
                            "client_id": oauth.api_key.value
                            , "redirect_uri": oauth.redirect_uri.value
                            , "client_secret": oauth.api_secret.value
                            , "code": req.query.code
                        }, function (err, facebookRes) {
                            // console.log(facebookRes);
                            // res.redirect('/loggedIn');
                            // Save the accessToken and redirect.
                            console.log('Yay! Access token is ' + facebookRes.access_token);
                            oauth.access_token = {
                                value: facebookRes.access_token,
                                label: 'Access Token'
                            };
                            oauth.access_token = {
                                value: facebookRes.expires,
                                label: 'Expires in'
                            };

                            _config.updateSpace({
                                data: oauth,
                                type: 'settings.oauth'
                            }, function () {
                                res.redirect('/#/');
                            });
                        });

                        break;
                    case 'spotify':
                        if (req.params.bounce == 'middle') {

                            var SpotifyWebApi = require('spotify-web-api-node');
                            // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
                            var spotifyApi = new SpotifyWebApi({
                               redirectUri: oauth.redirect_uri.value+'/middle',
                               clientId: oauth.api_key.value,
                               clientSecret: oauth.api_secret.value
                            });


                            // The code that's returned as a query parameter to the redirect URI
                            var code = req.query.code;
                            spotifyApi.authorizationCodeGrant(code)
                                .then(function (data) {
                                    console.log('The token expires in ' + data.body['expires_in']);
                                    console.log('The access token is ' + data.body['access_token']);
                                    console.log('The refresh token is ' + data.body['refresh_token']);

                                    /* Ok. We've got the access token!
                                     Save the access token for this user somewhere so that you can use it again.
                                     Cookie? Local storage?
                                     */

                                    // console.log(data);
                                    /* Redirecting back to the main page! :-) */
                                    // res.redirect('/#');

                                    oauth.access_token = {
                                        value: data.body['access_token'],
                                        label: 'Access Token'
                                    };
                                    oauth.expires_in = {
                                        value: data.body['expires_in'],
                                        label: 'Expires in'
                                    };
                                    oauth.refresh_token = {
                                        value: data.body['refresh_token'],
                                        label: 'Refresh Token'
                                    };

                                    _config.updateSpace({
                                        data: oauth,
                                        type: 'settings.oauth'
                                    }, function () {
                                        res.redirect('/#/');
                                    });

                                }, function (err) {
                                    res.send(err);
                                });
                        }

                        break;
                    case 'lastfm':

                        var LastfmAPI = require('lastfmapi');

                        // Create a new instance
                        var lfm = new LastfmAPI({
                            api_key:  oauth.api_key.value,    // sign-up for a key at http://www.last.fm/api
                            secret:  oauth.api_secret.value
                        });

                        lfm.authenticate(req.query.token, function(err, sessionData){
                            console.log(err, sessionData);

                            oauth.key = {
                                value: sessionData.key,
                                label: 'Key'
                            };
                            oauth.username = {
                                value: sessionData.username,
                                label: 'Username'
                            };

                            _config.updateSpace({
                                data: oauth,
                                type: 'settings.oauth'
                            }, function () {
                                res.redirect('/#/');
                            });
                        });

                        break;
                    case 'moves':

                        var Moves = require('moves');
                        var moves = new Moves({
                            client_id: oauth.api_key.value,
                            client_secret: oauth.api_secret.value,
                            redirect_uri: oauth.redirect_uri.value
                        });
                        moves.token(req.query.code, function (error, response, body) {

                            var data = JSON.parse(body);

                            oauth.access_token = {
                                value: data.access_token,
                                label: 'Access Token'
                            };
                            oauth.expires_in = {
                                value: data.expires_in,
                                label: 'Expires in'
                            };
                            oauth.refresh_token = {
                                value: data.refresh_token,
                                label: 'Refresh Token'
                            };

                            _config.updateSpace({
                                data: oauth,
                                type: 'settings.oauth'
                            }, function () {
                                res.redirect('/#/');
                            });
                        });

                        break;
                    case 'fitbit':

                        var FitbitApiClient = require("fitbit-node");
                        var fitbitApi = new FitbitApiClient({
                            clientID: oauth.api_key.value,
                            clientSecret: oauth.api_secret.value
                        });

                        fitbitApi.getAccessToken({
                            code: req.query.code,
                            redirectUrl: oauth.redirect_uri.value
                        }, function (error, response, body) {

                            var data = JSON.parse(body);

                            oauth.access_token = {
                                value: data.access_token,
                                label: 'Access Token'
                            };
                            oauth.expires_in = {
                                value: data.expires_in,
                                label: 'Expires in'
                            };
                            oauth.refresh_token = {
                                value: data.refresh_token,
                                label: 'Refresh Token'
                            };

                            _config.updateSpace({
                                data: oauth,
                                type: 'settings.oauth'
                            }, function () {
                                res.redirect('/#/');
                            });
                        });

                        break;

                    default:

                }
            });
        });

        //console.log(req.body);
        //console.log('>> /@end');
    });



};