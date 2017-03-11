var express = require('express');
var passport = require('passport');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var request = require('request');
var https = require('https');
var OAuth = require('oauth');
var Space = require('../models/spaceModel');
var Setting = require('../models/settingModel');
var Schema = require('../models/schemaModel');
var endpoints = require('./endpoints');
var objectPath = require('object-path');
// my own endpoints, read/write in mongo docs
var getEndpoint = function (data, cb) {
    // console.log(`[getEndpoint] ${data.action} -> `, data);
    return objectPath.get(endpoints, data.action)(data.space, data.type, function (resp) {
        cb(resp);
    });
};
var postEndpoint = function (data, content, cb) {
    // console.log(`[postEndpoint] ${data.action} -> `, data);
    var endpointAction = objectPath.get(endpoints, data.action);
    return endpointAction(data.space, content, data.type, function (resp) {
        cb(resp);
    });
};
router
    .get('/spaces', function (req, res) {
    Space.getAll(function (err, data) {
        res.json(data);
    });
})
    .get('/space/:space', function (req, res) {
    Space.findByName(req.params.space, function (err, data) {
        res.json(data[0]);
    });
})
    .delete('/space/:space', function (req, res) {
    Space.removeSpace(req.params.space, function () {
        res.status(200).send(req.params.space + " was deleted");
    });
});
// SPACES: ENDPOINTS TO GET DATA FROM DATAWHORE API
router
    .get('/get/:endpoint/:space', function (req, res) {
    var data = {
        space: req.params.space,
        type: req.query.type ? req.query.type : req.params.endpoint,
        action: req.params.endpoint + ".get"
    };
    getEndpoint(data, function (resp) {
        // console.log(`[endpoints.${data.action} response]`, resp);
        res.status(200).send(resp);
    });
})
    .put('/update/:endpoint/:space', function (req, res) {
    var data = {
        space: req.params.space,
        type: req.body.type ? req.body.type : req.params.endpoint,
        action: req.params.endpoint + ".write"
    };
    postEndpoint(data, req.body.data, function (resp) {
        // console.log(`[endpoints.${data.action} response]`, resp);
        res.json(resp);
    });
});
// SPACES: ENDPOINTS TO GET DATA FROM SPACES (TWITTER, INSTAGRAM, ETC)
router.post('/endpoint/space', function (req, res) {
    console.log('data', req.body.data);
    var data = req.body.data;
    var options;
    // requests to apis that need spaceOauthSettings shit
    if (data.apiEndpointUrl) {
        switch (data.space) {
            case 'tumblr':
            case 'twitter':
                options = {
                    hostname: data.apiUrl,
                    path: data.apiEndpointUrl,
                    headers: {
                        Authorization: getEchoAuth(data)
                    }
                };
                console.log(options);
                https.get(options, function (result) {
                    var buffer = '';
                    result.setEncoding('utf8');
                    result.on('data', function (dataReceived) {
                        buffer += dataReceived;
                    });
                    result.on('end', function () {
                        var response = JSON.parse(buffer);
                        var endpointAction = objectPath.get(endpoints, data.action);
                        endpointAction(data.space, response, data.type, function (updatedResponse) {
                            res.json(updatedResponse);
                        });
                    });
                });
                break;
            default:
                console.log('api endpoints, by access_token query');
                // console.log(options);
                if (!data.apiEndpointUrl.includes('?')) {
                    data.apiEndpointUrl += '?erratik=datawhore';
                }
                options = {
                    uri: "https://" + data.apiUrl + data.apiEndpointUrl + "&access_token=" + data.accessToken,
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
                        postEndpoint(req.body.data, body, function (resp) { return res.json(resp); });
                    }
                });
        }
    }
});
// UPLOADS
// todo: see if i can change this to a put?
router.post('/upload/:space/:folder/:filename', function (req, res) {
    var storage = multer.diskStorage({
        destination: function (_req, file, cb) {
            var folderName = '../public/uploads/' + _req.params.space + '/' + _req.params.folder;
            mkdirp(folderName, function (err) {
                cb(null, folderName);
            });
        },
        filename: function (_req, file, cb) {
            cb(null, _req.params.space + '-' + _req.params.filename + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        }
    });
    var upload = multer({
        storage: storage
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        // todo: return base64 string for the icon
        Space.updateSpaceSchema(req.params.space, { icon: req.file.path, modified: Date.now() }, function (space) { return res.json(space); });
        // res.json(req.file);
    });
});
function getEchoAuth(data) {
    // helper to construct echo/oauth headers from URL
    var oauth = new OAuth.OAuth("https://" + data.apiUrl + "/oauth/request_token", "https://" + data.apiUrl + "/oauth/access_token", data.apiKey, // test app token
    data.apiSecret, // test app secret
    '1.0', null, 'HMAC-SHA1');
    var orderedParams = oauth._prepareParameters(data.token, // test user token
    data.secret, // test user secret
    'GET', "https://" + data.apiUrl + data.apiEndpointUrl);
    return oauth._buildAuthorizationHeaders(orderedParams);
}
module.exports = router;
