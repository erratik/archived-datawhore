var mongoose = require('mongoose');
var moment = require('moment');
var multer = require('multer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var request = require('request');

var Space = require('../models/spaceModel');
var Setting = require('../models/settingModel');

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

    app.post('/api/space/endpoint', function(req, res) {

        var headers = {
            'Content-Type':     'application/x-www-form-urlencoded'
        };
        var options = {
            method: 'POST',
            headers: headers,
            uri: req.body.url,
            form: req.body.data
        };

        request(options, function (error, response, body) {
            if ( error){
                res.send(error);
            }
            res.send(body);
        });

    });


    /** API path that will upload the files */
    app.post('/api/upload/:space/:folder/:filename', function(req, res) {

        var storage = multer.diskStorage({ //multers disk storage settings
            destination: function (req, file, cb) {

                var folderName = '../public/uploads/'+ req.params.space +'/'+ req.params.folder;
                mkdirp(folderName, function(err) {
                    cb(null, folderName);
                });

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
            space.updateSpace({icon: req.file.path, modified: Date.now()}, function() {
                Space.findByName(req.params.space, function(err, space){
                    // console.log('space -> ', space);
                    res.json(space[0]);
                });
            });

            // res.json(req.file);
        });
    });
};