var Settings = require('../models/coreModel');
var Profile = require('../models/profileModel');

var mongoose = require('mongoose');
var moment = require('moment');

// expose the routes to our app with module.exports

module.exports = function(app) {


    // add specific properties to config -------------------------------------------------------*/
    app.post('/api/profile/update/:namespace/:type', function(req, res) {

        console.log('>> @start profileApi > Profile.update({name: '+req.params.namespace+', type: '+req.params.type+'}), '+req.params.type+'Properties update');
        console.log(req.body);
        console.log('>> /@end');

        //console.log(req.body[req.params.configType+'Properties']);

        var _profile = new Profile({name: req.params.namespace}); // instantiated Profile

        _profile.update({
            data: req.body,
            type: req.params.type
        }, function(err, saved) {
            if (saved) res.json(req.body);
        });
    });

    app.get('/api/profile/properties/:namespace', function(req, res) {

        Profile.findByName(req.params.namespace, function(err, profile){

            //console.log('>> @start Profile.findByName('+req.params.namespace+')');
            //console.log(profile[0]);
            //console.log('>> /@end');

            res.json(profile[0]);
        });

    });

    // wipe profile -------------------------------------------------------*/
    app.delete('/api/profiles/:namespace', function(req, res) {
        // //console.log('test');
        // get settings with mongoose, return default settings if !settings.saved
        Settings.findOne({
            name: 'settings'
        }, function(err, settings) {
            if (err) console.log(err);
            Config.remove({
                name: req.params.namespace
            }, function(err, profile) {
                if (err) res.send(err);
                settings.configs[req.params.namespace].profile = false;
                Settings.updateConfig(settings.configs);
                res.json(settings.configs[req.params.namespace]);
            });
        });
    });


};