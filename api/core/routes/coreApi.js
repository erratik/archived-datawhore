var mongoose = require('mongoose');
var moment = require('moment');


var Core = require('../models/coreModel');
var Space = require('../models/spaceModel');
var Setting = require('../models/settingModel');

// expose the routes to our app with module.exports
module.exports = function(app) {
    //*****************************************************************/  
    //    timestamp and status
    //*****************************************************************/
    app.get('/api/spaces', function(req, res) {
        Space.getAll(function(err, data){
            res.json(data);
        });
    });

    app.get('/api/space/:space', function(req, res) {
        Space.findByName(req.params.space, function(err, data){
            console.log(data);
            res.json(data);
        });
    });

    app.get('/api/space/settings/:space', function(req, res) {
        Setting.findBySpaceName(req.params.space, function(err, data){
            // console.log(data.extras);
            res.json(data);
        });
    });

    // create network object -------------------------------------------------------*/
    app.post('/api/core/add/:namespace', function(req, res) {
        //console.log(req.params.namespace);

        var _config = new Space({name: req.params.namespace}); // instantiated Space
        //console.log(_config);

        _config.updateSpace({
            type: 'network'
        }, function(config) {
            res.json(config);
        });

    });

    // update network settings in a config -------------------------------------------------------*/
    app.put('/api/space/update/:space', function(req, res) {
        var setting = new Setting(req.body); // instantiated Space
        setting.updateSettings(req.body, function() {
            Setting.findBySpaceName(req.params.space, function(err, space){
                console.log('space -> ', space);
                res.json(space);
            });
        });

    });

    // create network object -------------------------------------------------------*/
    app.post('/api/core/delete/:namespace', function(req, res) {
        //console.log(req.params.namespace);

        var _config = new Space({name: req.params.namespace}); // instantiated Space
        //console.log(_config);

        _config.delete(function(config) {
            //console.log(config);
            res.json(config);
        });

    });

    // application -------------------------------------------------------------
    app.get('/', function(req, res) {
        res.sendfile('../../index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};