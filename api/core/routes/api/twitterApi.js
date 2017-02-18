// required packages
var Config = require('../../models/spaceModel');
var Drop = require('../../models/dropModel');

var mongoose = require('mongoose');
var _ = require('lodash');

var assignValues = require('../../../utils/prioritize').assignValues;

// network config
var namespace = 'twitter';
var Twitter = require('twitter');
var client = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var params = {
    // screen_name: 'wptweeto'
    screen_name: process.env.TWITTER_USERNAME
};
// expose the routes to our app with module.exports
module.exports = function(app) {
    app.get('/api/' + namespace + '/fetch/:type', function(req, res) {

        if (req.params.type == 'profile') {
            client.get('users/show', params, function (error, docs, response) {
                if (!error) {

                    resetConfig(req.params.type, docs, function(boom){
                        res.json(boom);
                    });
                } else {
                    //console.log(error)
                }
            });
        } else {
            client.get('statuses/user_timeline', params, function (error, posts, response) {
                if (!error) {

                    delete posts[0].user;

                    resetConfig(req.params.type, posts[0], function(boom){
                        res.json(boom);
                    });
                } else {
                    //console.log(error)
                }
            });

        }
            
    });

    app.post('/api/' + namespace + '/fetch/posts/:count/:sample', function(req, res) {
        // //console.log(req.params);
        // //console.log(req.body);
        // //console.log(req);

        client.get('statuses/user_timeline', params, function(error, posts, response) {
            if (error) {
                //console.log(err);
            } else {
                ////console.log('req.body > '+ req.body);
                posts = _.filter(posts, function(post){
                    return assignValues(post);
                });

                Drop.storeRain({
                    namespace: namespace,
                    posts: posts,
                    sample: req.params.sample
                },
                function(drops) {

                    res.json(drops);

                });
                //res.json({posts:medias, flat: flatten(medias, {delimiter: '__'})});
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

            //});
        });
    };

};
