var mongoose = require('mongoose');
var moment = require('moment');
var multer = require('multer');
var fs = require('fs');


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
        Setting.findSettings(req.params.space, function(err, data){
            res.json(data);
        });
    });

    app.put('/api/space/update/:space', function(req, res) {
        var setting = new Setting(req.body); // instantiated Space

        setting.updateSettings(req.body, function() {
            Setting.findSettings(req.params.space, function(err, space){
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

    /** API path that will upload the files */
    app.post('/api/upload/:space/:folder/:filename', function(req, res) {

        var storage = multer.diskStorage({ //multers disk storage settings
            destination: function (req, file, cb) {
                // todo: create folders if they don't exist
                cb(null, '../public/uploads/'+ req.params.space +'/'+ req.params.folder);
            },
            filename: function (req, file, cb) {
                cb(null, req.params.space + '-' + req.params.filename + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
            }
        });
        var upload = multer({ //multer settings
            storage: storage
        }).single('file');

        upload(req, res,function(err){

            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }

            var space = new Space({name: req.params.space}); // instantiated Space
            space.updateSpace({icon: req.file.path}, function() {
                Space.findByName(req.params.space, function(err, space){
                    console.log('space -> ', space);
                    // res.json(space);
                });
            });

            res.json(req.file);
        });
    });
};