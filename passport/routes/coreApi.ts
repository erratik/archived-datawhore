const express = require('express');
const passport = require('passport');
const router = express.Router();

let multer = require('multer');
let fs = require('fs');
let mkdirp = require('mkdirp');
let request = require('request');
let https = require('https');
let OAuth = require('oauth');

let Space = require('../models/spaceModel');
let Setting = require('../models/settingModel');
let Schema = require('../models/schemaModel');

let endpoints = require('./endpoints');
let objectPath = require('object-path');

// my own endpoints, read/write in mongo docs
let getEndpoint = (data, cb) => {
    // console.log(`[getEndpoint] ${data.action} -> `, data);
    return objectPath.get(endpoints, data.action)(data.space, data.type, function (resp) {
        cb(resp);
    });
};

let postEndpoint = (data, content, cb) => {
    // console.log(`[postEndpoint] ${data.action} -> `, data);
    const endpointAction = objectPath.get(endpoints, data.action);
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
            res.status(200).send(`${req.params.space} was deleted`);
        });

    });
// SPACES: ENDPOINTS TO GET DATA FROM DATAWHORE API
router
    .get('/get/:endpoint/:space', (req, res) => {

        const data = {
            space: req.params.space,
            type: req.query.type ? req.query.type : req.params.endpoint,
            action: `${req.params.endpoint}.get`
        };

        getEndpoint(data, (resp) => {
            console.log(`[endpoints.${data.action} response]`, resp);
            res.json(resp);
        })
    })
    .put('/update/:endpoint/:space', (req, res) => {

        const data = {
            space: req.params.space,
            type: req.body.type ? req.body.type : req.params.endpoint,
            action: `${req.params.endpoint}.write`
        };

        postEndpoint(data, req.body.data, (resp) => {
            console.log(`[endpoints.${data.action} response]`, resp);
            res.json(resp);
        })
    });

// SPACES: ENDPOINTS TO GET DATA FROM SPACES (TWITTER, INSTAGRAM, ETC)
router.post('/endpoint/space', function (req, res) {

    console.log('data', req.body.data);

    const data = req.body.data;

    let options;
    // requests to apis that need spaceOauthSettings shit
    if (data.apiEndpointUrl) {
        switch (data.space) {
            case 'twitter':
                options = {
                    hostname: data.apiUrl,
                    path: data.apiEndpointUrl,
                    headers: {
                        Authorization: getEchoAuth(`https://${data.apiUrl}${data.apiEndpointUrl}`, data.token, data.secret, data.apiKey, data.apiSecret)
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

                console.log('api endpoints, by access_token query');
                // console.log(options);

                if (!data.apiEndpointUrl.includes('?')) {
                    data.apiEndpointUrl += '?erratik=datawhore'
                }

                options = {
                    uri: `https://${data.apiUrl}${data.apiEndpointUrl}&access_token=${data.accessToken}`,
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
            // }

        }

    }

});

// UPLOADS
// todo: see if i can change this to a put?
router.post('/upload/:space/:folder/:filename', function (req, res) {

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

        // todo: return base64 string for the icon
        Space.updateSpaceSchema(
            req.params.space,
            {icon: req.file.path, modified: Date.now()},
            (space) => res.json(space));

        // res.json(req.file);
    });
});

function getEchoAuth(url, token, secret, apiKey, apiSecret) {
    // helper to construct echo/oauth headers from URL
    const oauth = new OAuth.OAuth('https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        apiKey, // test app token
        apiSecret, // test app secret
        '1.0',
        null,
        'HMAC-SHA1');
    const orderedParams = oauth._prepareParameters(
        token, // test user token
        secret, // test user secret
        'GET',
        url
    );
    return oauth._buildAuthorizationHeaders(orderedParams);
}

module.exports = router;
