// required packages
var Config = require('../../models/spaceModel');
var Drop = require('../../models/dropModel');

var mongoose = require('mongoose');
var _ = require('lodash');

var assignValues = require('../../../utils/prioritize').assignValues;

var namespace = 'facebook';
var graph = require('fbgraph');



// expose the routes to our app with module.exports
module.exports = function (app) {

    var oauth;
    Config.getOauthSettings('facebook', function (err, data) {
        // console.log(data[0]);
        //if (!_.isNil(data[0].settings)) {
        //    oauth = data[0].settings.oauth;
        //    //Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
        //    // graph.({
        //    //     "client_id": oauth.api_key.value
        //    //     , "redirect_uri": oauth.redirect_uri.value
        //    //     , "client_secret": oauth.api_secret.value
        //    //     , "code": req.query.code
        //    // }, function (err, facebookRes) {
        //    //     // console.log(facebookRes);
        //    //     // res.redirect('/loggedIn');
        //    //     // Save the accessToken and redirect.
        //    //     console.log('Yay! Access token is ' + facebookRes.access_token);
        //    //     oauth.access_token = {
        //    //         value: facebookRes.access_token,
        //    //         label: 'Access Token'
        //    //     };
        //    //     oauth.access_token = {
        //    //         value: facebookRes.expires,
        //    //         label: 'Expires in'
        //    //     };
        //    //
        //    //     console.log(oauth);
        //    //
        //    //     // _config.update({
        //    //     //     data: oauth,
        //    //     //     type: 'settings.oauth'
        //    //     // }, function () {
        //    //     //     res.redirect('/#/');
        //    //     // });
        //    // });
        //    var options = {
        //        timeout: 3000
        //        , pool: {maxSockets: Infinity}
        //        , headers: {connection: "keep-alive"}
        //    };
        //}

        // graph.get("me", {access_token: oauth.access_token.value, fields: 'id,name,location'}, function (err, res) {
        //     console.log(res); // { id: '4', name: 'Mark Zuckerberg'... }
        // });
    });

    app.get('/api/' + namespace + '/fetch/:type', function (req, res) {


        var _config = new Config({name: namespace}); // instantiated Space
        if (req.params.type == 'profile') {
            // //console.log('boo');

            graph.get("me", {
                access_token: oauth.access_token.value,
                fields: 'id,name,location,birthday,friends,picture,cover'
            }, function (err, response) {


                _config.resetConfig({
                    type: req.params.type,
                    data: response
                }, function (boom) {
                    res.json(boom);
                });
            });

        } else {

            graph.get("me/feed", {
                access_token: oauth.access_token.value
            }, function (err, response) {
                console.log(response);

                _config.resetConfig({
                    type: req.params.type,
                    data: response.data[0]
                }, function (boom) {
                    res.json(boom);
                });
            });
        }

    });

    //GET POSTS
    app.post('/api/' + namespace + '/fetch/posts/:count/:sample', function (req, res) {

        graph.get("me/feed", {
            access_token: oauth.access_token.value
        }, function (err, response) {
            // console.log(response.data);
            // console.log(_.slice(response.data, 0, 1));
            // console.log(_.chunk(1, response.data));

            Drop.storeRain({
                namespace: namespace,
                posts: _.slice(response.data, 0, req.params.count),
                sample: req.params.sample
            }, function(drops) {

                res.json(drops);

            });
        });
    });


};