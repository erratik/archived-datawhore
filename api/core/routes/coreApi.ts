let multer = require('multer');
let fs = require('fs');
let mkdirp = require('mkdirp');
let request = require('request');
let https = require('https');

let Space = require('../models/spaceModel');
let Setting = require('../models/settingModel');
let Schema = require('../models/schemaModel');

let endpoints = require('./endpoints');
let objectPath = require('object-path');

// my own endpoints, read/write in mongo docs
let getEndpoint = (data, cb) => {
    console.log(data)
    const endpointAction = objectPath.get(endpoints, data.action);
    return endpointAction(data.space, data.type, function (resp) {
        cb(resp);
    });
};

let postEndpoint = (data, content, cb) => {
    const endpointAction = objectPath.get(endpoints, data.action);
    return endpointAction(data.space, content, data.type, function (resp) {
        cb(resp);
    });
};

module.exports = function (app) {

    // SPACES
    app.get('/api/spaces', function (req, res) {
        Space.getAll(function (err, data) {
            res.json(data);
        });
    });

    app.get('/api/space/:space', function (req, res) {
        Space.findByName(req.params.space, function (err, data) {
            res.json(data[0]);
        });
    });

    // SPACES: ENDPOINTS TO GET DATA
    app.post('/api/space/endpoint', function (req, res) {

        console.log('data', req.body.data);

        const data = req.body.data;

        let options;
        // requests to apis that need oauth2 shit
        if (data.apiEndpointUrl) {
            switch (data.space) {
                case 'twitter':

                    options = {
                        hostname: data.apiUrl,
                        path: data.apiEndpointUrl,
                        headers: {
                            Authorization: 'Bearer ' + data.accessToken
                        }
                    };

                    https.get(options, function (result) {

                        let buffer = '';
                        result.setEncoding('utf8');
                        result.on('data', function (dataReceived) {
                            buffer += dataReceived;
                        });
                        result.on('end', function () {
                            const response = JSON.parse(buffer);
                            const endpointAction = objectPath.get(endpoints, data.action);
                            endpointAction(data.space, response, data.type, function (updatedResponse) {
                                res.json(updatedResponse);
                            });
                        });
                    });

                    break;
                default:
                    options = {
                        uri: `https://${data.apiUrl}${data.apiEndpointUrl}?access_token=${data.accessToken}`,
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    };

                    request(options, function (error, response, body) {
                        if (error) {
                            res.send(error);
                        }

                        if (data.action.includes('.write')) {
                            postEndpoint(req.body.data, body, (resp) => res.json(resp));
                        }

                    });
            }


        } else {
            // fallbacks when there are not specific routes set for the action
            if (data.action.includes('.write')) {
                postEndpoint(req.body.data, req.body.data.content, (resp) => res.json(resp));
            } else {
                getEndpoint(req.body.data, (resp) => res.json(resp));
            }
        }

    });

    // SPACES: SETTINGS (MOSTLY OAUTH, FOR NOW)
    app.get('/api/space/settings/:space', function (req, res) {
        Setting.findSettings(req.params.space, function (err, data) {
            res.json(data);
        });
    });

    app.put('/api/space/update/:space', function (req, res) {
        const space = new Space({name: req.params.space}); // instantiated Space
        req.body.data.modified = Date.now();
        console.log(req.body);
        space.updateSpace(req.body.data, function () {
            Space.findByName(req.params.space, function (error, _space) {
                res.json(_space[0]);
            });
        });

    });

    app.put('/api/space/update/settings/:space', function (req, res) {
        const setting = new Setting(req.body); // instantiated Space

        Setting.updateSettings(req.body, function () {
            Setting.findSettings(req.params.space, function (err, space) {
                // console.log('space -> ', space);
                res.json(space);
            });
        });

    });

    // SCHEMAS (PROFILES, POSTS FOR SPACES)
    app.post('/api/space/schemas', (req, res) => getEndpoint(req.body, (resp) => res.json(resp)));
    app.post('/api/space/profile', (req, res) => getEndpoint(req.body, (resp) => {
        console.log(resp)
        res.json(resp);
    }));

    // UPLOADS
    // todo: see if i can change this to a put?
    app.post('/api/upload/:space/:folder/:filename', function (req, res) {

        const storage = multer.diskStorage({
            destination: function (_req, file, cb) {

                const folderName = '../public/uploads/' + _req.params.space + '/' + _req.params.folder;
                mkdirp(folderName, function (err) {
                    cb(null, folderName);
                });

            },
            filename: function (_req, file, cb) {
                cb(null, _req.params.space + '-' + _req.params.filename + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
            }
        });
        const upload = multer({ // multer settings
            storage: storage
        }).single('file');

        upload(req, res, function (err) {

            if (err) {
                res.json({error_code: 1, err_desc: err});
                return;
            }

            const space = new Space({name: req.params.space}); // instantiated Space
            space.updateSpace({icon: req.file.path, modified: Date.now()}, function () {
                Space.findByName(req.params.space, function (error, _space) {
                    // console.log('space -> ', space);
                    // todo: return base64 string
                    res.json(_space[0]);
                });
            });

            // res.json(req.file);
        });
    });
};
