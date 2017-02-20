var mongoose = require('mongoose');
var moment = require('moment');


var Space = require('../models/spaceModel');
var Setting = require('../models/settingModel');
var request = require('request');


module.exports = function(app) {

    app.get('/api/spaces', function(req, res) {
        Space.getAll(function(err, data){
            res.json(data);
        });
    });

    app.get('/api/space/:space', function(req, res) {
        Space.findByName(req.params.space, function(err, data){
            res.json(data[0]);
        });
    });

    app.get('/api/space/settings/:space', function(req, res) {
        Setting.findBySpaceName(req.params.space, function(err, data){
            res.json(data);
        });
    });

    app.put('/api/space/update/:space', function(req, res) {
        var setting = new Setting(req.body); // instantiated Space

        setting.updateSettings(req.body, function() {
            Setting.findBySpaceName(req.params.space, function(err, space){
                // console.log('space -> ', space);
                res.json(space);
            });
        });

    });

    // todo: move this to its own api file
    app.post('/api/oauth/middleware', function(req, res) {

        var headers = {
            'Content-Type':     'application/x-www-form-urlencoded'
        };

        var options = {
            url: req.body.url,
            method: 'POST',
            headers: headers,
            form: req.body.data
        };

        request.post(options, function (error, response, body) {
            console.log(body);
            res.send(body);
        });

    });
};