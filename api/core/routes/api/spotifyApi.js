
var Config = require('../../models/spaceModel');
var Drop = require('../../models/dropModel');

var mongoose = require('mongoose');
var _ = require('lodash');

var namespace = 'swarm';

var assignValues = require('../../../utils/prioritize').assignValues;

var SpotifyWebApi = require('spotify-web-api-node');

// expose the routes to our app with module.exports
module.exports = function(app) {

    var oauth, spotifyApi;
    Config.getOauthSettings('spotify', function(err, data){
        // console.log(data[0]);
        if (!_.isNil(data[0])) {
            oauth = data[0].settings.oauth;
            // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
            spotifyApi = new SpotifyWebApi({
                redirectUri: oauth.redirect_uri.value,
                clientId: oauth.api_key.value,
                clientSecret: oauth.api_secret.value
            });
            spotifyApi.setAccessToken(oauth.access_token.value);
        }
    });

    app.get('/api/:namespace/fetch/:type', function(req, res) {

            // Get Elvis' albums
            spotifyApi.getMe()
               .then(function(data) {
                   console.log('Some information about the authenticated user', data.body);

                   resetConfig(req.params.type, data.body, function(boom){
                       res.json(boom);
                   });
               }, function(err) {
                   console.log('Something went wrong!', err);
               });


            /*if (req.params.type == 'profile') {

                client.Users.getUser('self', process.env.SWARM_ACCESS_TOKEN,
                    function (error, data) {
                        if(error) {
                            //console.log(error);
                        } else {
                            //console.log(data.user);
                            // resetConfig(req.params.type, data.user, function(boom){
                            //     res.json(boom);
                            // });

                        }
                    });
            } else {

                client.Users.getCheckins('self', {limit: 1}, process.env.SWARM_ACCESS_TOKEN, function (error, data) {
                    //console.log(data.checkins.items[0]);
                    resetConfig(req.params.type, data.checkins.items[0], function(boom){
                        res.json(boom);
                    });

                });

            }*/

    });


    app.post('/api/' + namespace + '/fetch/posts/:count/:sample', function(req, res) {

        client.Users.getCheckins('self', {limit: req.params.count}, process.env.SWARM_ACCESS_TOKEN, function (error, data) {

            if (error) {
                //console.log(err);
            } else {
                ////console.log('req.body > '+ req.body);
                var posts = _.filter(data.checkins.items, function(media){
                    return assignValues(media);
                });

                Drop.storeRain({
                    namespace: namespace,
                    posts: posts,
                    sample: req.params.sample
                }, function(drops) {
                    res.json(drops);
                });

            }
        });

    });

    var resetConfig = function(type, update, cb) {

        var _config = new Config({name: namespace}); // instantiated Space

        _config.updateSpace({
            data: update,
            type: type,
            reset: true
        }, function(config) {
            cb(config);
        });
    };
};