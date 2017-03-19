const express = require('express');
const passport = require('passport');
const router = express.Router();

const multer = require('multer');
const fs = require('fs');
const mkdirp = require('mkdirp');
const request = require('request');
const https = require('https');
const OAuth = require('oauth');
const refresh = require('passport-oauth2-refresh');

const Space = require('../models/spaceModel');
const Setting = require('../models/settingModel');
const Schema = require('../models/schemaModel');

const endpoints = require('./endpoints');
const objectPath = require('object-path');

// my own endpoints, read/write in mongo docs
let getEndpoint = (data, cb) => {
    // console.log(`[getEndpoint] ${data.action} -> `, data);
    const endpointAction = objectPath.get(endpoints, data.action);
    if (typeof endpointAction === 'function') {
        return endpointAction(data.space, data.type, function (resp) {
            cb(resp);
        });
    } else {
        cb('no endpoints set for ' + data.action)
    }
};

let postEndpoint = (data, content, cb) => {
    // console.log(`[postEndpoint] ${data.action} -> `, data);
    const endpointAction = objectPath.get(endpoints, data.action);
    const sendObj = {space: data.space};
    if (!data.override) {
        content = data.more ? data.more : content;
    } else {
        content = {
            content: content,
            type: data.type
        };
    }
    if (data.type.includes('rain') && data.more) content['fetchUrl'] = data.more.fetchUrl;

    return endpointAction(sendObj, content, data.type, function (resp) {
        cb(resp);
    });
};

const makeOAuthHeaders = (data) => {
    // helper to construct echo/oauth headers from URL
    const oauth = new OAuth.OAuth(`https://${data.apiUrl}/oauth/request_token`,
        `https://${data.apiUrl}/oauth/access_token`,
        data.apiKey,
        data.apiSecret,
        '1.0',
        null,
        'HMAC-SHA1');
    const orderedParams = oauth._prepareParameters(
        data.token, // test user token
        data.secret, // test user secret
        'GET',
        `https://${data.apiUrl}${data.apiEndpointUrl}`
    );
    return oauth._buildAuthorizationHeaders(orderedParams);
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
        Space.removeSpace(req.params.space, () => res.status(200).send({ message: `${req.params.space} was deleted` }));
    })
    .delete('/schema/:space/:type', function (req, res) {
        Schema.removeSchema(req.params.space, req.params.type, function () {
            res.status(200).send({ message: `${req.params.space} schema was deleted for ${req.params.space}` });
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
            // console.log(`[endpoints.${data.action} response]`, resp);
            res.status(200).send(resp);
        })
    })
    .put('/update/:endpoint/:space', (req, res) => {

        const data = {
            space: req.params.space,
            type: req.body.type ? req.body.type : req.params.endpoint,
            action: `${req.params.endpoint}.write`
        };

        req.body.data = (req.body.topSchema) ? req.body.topSchema : req.body.data;

        console.log(req.body);
        postEndpoint(data, req.body.data, (resp) => {
            res.json(resp);
        })
    });

// SPACES: ENDPOINTS TO GET DATA FROM SPACES (TWITTER, INSTAGRAM, ETC)
router.post('/endpoint/space', function (req, res) {

    console.log('dahjhta', req.body.data);

    let data = req.body.data;

                    if (req.body.more) {
                        data['more'] = req.body.more;
                    }

    let options;
    if (data.apiEndpointUrl) {
        switch (data.space) {

            // OAuth Authorization requests
            case 'tumblr':
            case 'twitter':
                options = {
                    hostname: data.apiUrl,
                    path: data.apiEndpointUrl,
                    headers: {
                        Authorization: makeOAuthHeaders(data)
                    }
                };
                console.log(options);


                https.get(options, function (result) {
                    let buffer = '';
                    result.setEncoding('utf8');
                    result.on('data', (dataReceived) => buffer += dataReceived);

                    result.on('end', () => postEndpoint(data, JSON.parse(buffer), (resp) => res.json(resp)));
                });
                break;

            // Access Token requests
            default:

                data.apiEndpointUrl += !data.apiEndpointUrl.includes('?') ? `?erratik=datawhore` : `&v=${Date.now()}`;

                options = {
                    uri: `https://${data.apiUrl}${data.apiEndpointUrl}&access_token=${data.accessToken}&oauth_token=${data.accessToken}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                const requestDataWithToken = () => request(options, (error, response, body) => {
                    if (error) {
                        res.send(error);
                    }

                    if (body) {
                        const err = JSON.parse(body).error || {};
                        console.log('requestData running ...', err.status);
                        if (err.status === 401) {

                            console.log('refreshing tokens');
                            Setting.findSettings(data.space, (settings) => {
                                refresh.requestNewAccessToken(data.space, data.refreshToken, (_e, accessToken, refreshToken) => {
                                    // `refreshToken` may or may not exist, depending on the strategy you are using.

                                    refreshToken = refreshToken ? refreshToken : data.refreshToken;
                                    const keys = { accessToken: accessToken, refreshToken: refreshToken };
                                    settings.extras = Object.keys(keys).map(key => {
                                        return {
                                            'type': 'oauth',
                                            'value': keys[key],
                                            'label': key
                                        };
                                    });
                                    console.log(settings.extras);

                                    Setting.updateSettings(settings, () => {
                                        data.accessToken = accessToken;
                                        console.log('saved new token: ' + accessToken);
                                        // fakeError = 200;
                                        requestDataWithToken();
                                    }
                                    );

                                });
                            });

                        } else {

                            postEndpoint(data, body, (resp) => res.json(resp));
                        }
                        // res.status(err.status).json({message: err.message});
                    }
                });

                requestDataWithToken();
        }

    }

});

// UPLOADS
// todo: change this to a put request
router.post('/upload/:space/:folder/:filename', function (req, res) {

    const storage = multer.diskStorage({
        destination: (_req, file, cb) => {
            const folderName = '../public/uploads/' + _req.params.space + '/' + _req.params.folder;
            mkdirp(folderName, function (err) {
                cb(null, folderName);
            });
        },
        filename: (_req, file, cb) => {
            cb(null, _req.params.space + '-' + _req.params.filename + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        }
    });

    // multer settings
    const upload = multer({ storage: storage }).single('file');

    upload(req, res, function (err) {

        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }

        // todo: return base64 string for the icon
        Space.updateSpace(
            req.params.space,
            { icon: req.file.path, modified: Date.now() },
            (space) => res.json(space));

        // res.json(req.file);
    });
});


module.exports = router;
