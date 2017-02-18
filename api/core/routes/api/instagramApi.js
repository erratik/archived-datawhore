// required packages
var mongoose = require('mongoose');
var _ = require('lodash');

// models
var Config = require('../../models/spaceModel');
var Drop = require('../../models/dropModel');

// custom packages
var assignValues = require('../../../utils/prioritize').assignValues;
var util = require('../../models/dropModel');


// route config
var namespace = 'instagram';
var client = require('instagram-node').instagram();

module.exports = function(app) {


    var oauth;
    Config.getOauthSettings(namespace, function (err, data) {
        // console.log(data[0]);
        //if (!_.isNil(data[0].settings)) {
        //    oauth = data[0].settings.oauth;
        //    // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
        //    client.use({
        //        client_id: oauth.api_key.value,
        //        client_secret: oauth.api_secret.value,
        //        access_token: oauth.access_token.value
        //    });
        //}
    });

    app.get('/api/' + namespace + '/fetch/:type', function(req, res) {

        var _config = new Config({name: namespace}); // instantiated Space

        if (req.params.type == 'profile') {

            client.user('self', function(err, result, remaining, limit) {
                if (err) {
                    console.log(err);
                } else {

                    _config.resetConfig({
                        type: req.params.type,
                        data: result
                    }, function (boom) {
                        res.json(boom);
                    });

                }
            });
        } else {

            client.user_self_media_recent({count: 5}, function(err, medias, pagination, remaining, limit) {
                if (err) {
                    console.log(err);
                } else {
                    _config.resetConfig({
                        type: req.params.type,
                        data: medias[4]
                    }, function (boom) {
                        res.json(boom);
                    });
                }
            });
        }

            
    });

    app.post('/api/' + namespace + '/fetch/posts/:count/:sample', function(req, res) {
        // //console.log(req.params);
        // //console.log(req.body);
        // //console.log(req);

        client.user_self_media_recent({count: req.params.count}, function(err, medias, pagination, remaining, limit) {
            if (err) {
                //console.log(err);
            } else {
                ////console.log('req.body > '+ req.body);
                var posts = _.filter(medias, function(media){
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


};

