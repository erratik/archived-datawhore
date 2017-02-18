var Config = require('../../models/spaceModel');
var Drop = require('../../models/dropModel');
var _ = require('lodash');

var mongoose = require('mongoose');
var namespace = 'lastfm';

var oauth;
Config.getOauthSettings(namespace, function (err, data) {
    //if (!_.isNil(data[0].settings)) {
    //    oauth = data[0].settings.oauth;
    //}
});
// expose the routes to our app with module.exports
module.exports = function (app) {

    app.get('/api/' + namespace + '/fetch/:type', function (req, res) {

        // console.log(oauth);
        var _config = new Config({name: namespace}); // instantiated Space
        var LastfmAPI = require('lastfmapi');

        // Create a new instance
        var lfm = new LastfmAPI({
            api_key: oauth.api_key.value,    // sign-up for a key at http://www.last.fm/api
            secret: oauth.api_secret.value
        });

        lfm.setSessionCredentials(oauth.username.value, oauth.key.value);

        if (req.params.type == 'profile') {
            lfm.user.getInfo(oauth.username.value, function (err, info) {
                // console.log(info);

                _config.resetConfig({
                    type: req.params.type,
                    data: info
                }, function (boom) {
                    res.json(boom);
                });
            });
        } else {

            lfm.user.getRecentTracks({
                user: oauth.username.value,
                limit: 1
            }, function (err, tracks) {
                if (err) {
                    console.log(err);
                } else {
                    // res.json(tracks);

                    _config.resetConfig({
                        type: req.params.type,
                        data: tracks.track[0]
                    }, function (boom) {
                        res.json(boom);
                    });
                }
            });
        }

    });
    

    //GET POSTS
    app.post('/api/' + namespace + '/fetch/posts/:count/:sample', function(req, res) {
        //console.log(req.body);

        // console.log(oauth);
        var _config = new Config({name: namespace}); // instantiated Space
        var LastfmAPI = require('lastfmapi');

        // Create a new instance
        var lfm = new LastfmAPI({
            api_key: oauth.api_key.value,    // sign-up for a key at http://www.last.fm/api
            secret: oauth.api_secret.value
        });

        lfm.setSessionCredentials(oauth.username.value, oauth.key.value);

        lfm.user.getRecentTracks({
            user: oauth.username.value,
            limit: req.params.count
        }, function (err, scrobbles) {
            if (err) {
                console.log(err);
            } else {
                // console.log(scrobbles.track);

                Drop.storeRain({
                    namespace: namespace,
                    posts: scrobbles.track,
                    sample: req.params.sample
                }, function(drops) {

                    res.json(drops);

                });
            }
        });
    });
};