
let Setting = require('../models/settingModel');
let Drop = require('../models/dropModel');
let endpoints = require('../routes/endpoints');
const objectPath = require('object-path');
const OAuth = require('oauth');
const request = require('request');
const https = require('https');
const DROP_FETCH_EXTRAS = require('../constants.class').DROP_FETCH_EXTRAS;

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

module.exports = that = {
    savePassport: function (space, settings, extras, profile, done) {


        endpoints.schema.write(space, profile, 'profile', function(schema) {
            console.log('connect profile saving', profile);

            settings.extras  = Object.keys(extras).map(key => {
                return {
                    'type': 'oauth',
                    'value': extras[key],
                    'label': key === 'token' ? 'accessToken' : key
                };
            });

            console.log('saving passport', settings);
            Setting.updateSettings(settings, function (settings) {
                    done(null, settings);
                }
            );
        });

    },
    pluck: (key, array) => {
        const plucked = array.filter(arr => {
            const _key = arr.keyName ? arr.keyName : arr.label;
            if (_key === key) {
                return arr.value;
            }
        })[0];
        return plucked.value;
    },
    URLtoObject: (str) => {
        var obj = {};
        str.replace(/([^=&]+)=([^&]*)/g, function(m, key, value) {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return obj;
    },
    endpointSpaceCall: (data, req, res, cb = null) => {
        const runCall = (data, req, res, cb = null) => {
            Setting.findSettings(data.space, (o) => {

                data.apiUrl = that.pluck('apiUrl', o.oauth);
                data.apiKey = that.pluck('apiKey', o.oauth);
                data.apiSecret = that.pluck('apiSecret', o.oauth);
                data.accessToken = that.pluck('accessToken', o.extras);
                data.fetchUrl = data.apiEndpointUrl;
                console.log('dahjhta', data);
                let urlExtras;
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
                        //console.log(options);

                        https.get(options, function (result) {
                            let buffer = '';
                            result.setEncoding('utf8');
                            result.on('data', (dataReceived) => buffer += dataReceived);

                            result.on('end', () => that.postEndpoint(data, JSON.parse(buffer), (resp) => {
                                if (res) {
                                    res.json(resp);
                                } else {
                                    cb(resp);
                                }
                            }));
                        });
                        break;

                    case 'instagram':

                        urlExtras = Object.keys(extras).map(function(k) {
                            return encodeURIComponent(k) + "=" + encodeURIComponent(extras[k]);
                        }).join('&');

                    // Access Token requests
                    default:

                        data.apiEndpointUrl += !data.apiEndpointUrl.includes('?') ? `?erratik=datawhore` : `&v=${Date.now()}`;
                        if (urlExtras) {
                            data.apiEndpointUrl += '&'+urlExtras;
                        }
                        options = {
                            uri: `https://${data.apiUrl}${data.apiEndpointUrl}&access_token=${data.accessToken}&oauth_token=${data.accessToken}`,
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };
                        console.log(options);

                        const requestDataWithToken = () => request(options, (error, response, body) => {
                            if (error) {
                                if (res) {
                                    res.send(error);
                                } else {
                                    cb(error);
                                }
                            }

                            if (body) {
                                const err = JSON.parse(body).error || {};
                                // console.log('requestData running ...', err.status);
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

                                    that.postEndpoint(data, body, (resp) => {
                                        if (res) {
                                            res.json(resp)
                                        } else {
                                            cb(resp);
                                        }
                                    });
                                }
                                // res.status(err.status).json({message: err.message});
                            }
                        });

                        requestDataWithToken();
                    }

                }
            });
        };
        let extras;
        if (req && req.body.extras) {
            extras = DROP_FETCH_EXTRAS(data.space, data.isFetchingPast);
            runCall(data, req, res);
        } else {

            Drop.findDrops(data.space, 'all', function (_data) {
                extras = DROP_FETCH_EXTRAS(data.space, data.isFetchingPast, _data);
                runCall(data, req, res, cb);
            });
        }
    },
    // my own endpoints, read/write in mongo docs
    getEndpoint: (data, cb) => {
        // console.log(`[getEndpoint] ${data.action} -> `, data);
        const endpointAction = objectPath.get(endpoints, data.action);
        if (typeof endpointAction === 'function') {
            return endpointAction(data.space, data.type, function (resp) {
                cb(resp);
            });
        } else {
            cb({message: 'no endpoints set for ' + data.action});
        }
    },
    postEndpoint: (data, content, cb) => {
        // console.log(`[postEndpoint] ${data.action} -> `, data);
        const endpointAction = objectPath.get(endpoints, data.action);

        if (data.type.includes('rain') && !data.action.includes('update')) content['fetchUrl'] = data.fetchUrl;
        const extras = data;

        return endpointAction(data.space, content, data.type, function (resp) {
            cb(resp);
        }, data);
    }
};

function Extras(type, value, label) {
    this.type = type;
    this.value = value;
    this.label = label;
}

