
let Setting = require('../models/settingModel');
let Drop = require('../models/dropModel');
let endpoints = require('../routes/endpoints');
const objectPath = require('object-path');
const OAuth = require('oauth');
const request = require('request');
const refresh = require('passport-oauth2-refresh');
const https = require('https');
const DROP_FETCH_EXTRAS = require('../constants.class').DROP_FETCH_EXTRAS;

const makeOAuthHeaders = (data) => {
    const v = data.space === 'twitter' ? '1.1' : '1.0';
    // helper to construct echo/oauth headers from URL
    const oauth = new OAuth.OAuth(`https://${data.apiUrl}/oauth/request_token`,
        `https://${data.apiUrl}/oauth/access_token`,
        data.apiKey,
        data.apiSecret,
        v,
        null,
        'HMAC-SHA1');
    const orderedParams = oauth._prepareParameters(
        data.tokenSecret, // test user token
        data.accessToken, // test user secret
        'GET',
        `https://${data.apiUrl}${data.url}`
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
        if (plucked) {
            return plucked.value;
        }
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
                data.refreshToken = that.pluck('refreshToken', o.extras);
                data.tokenSecret = that.pluck('refreshToken', o.extras);
                data.fetchUrl = data.apiEndpointUrl;
                // console.log('dahjhta', data);

                let urlExtras;

                urlExtras = Object.keys(extras).map(function(k) {
                    return encodeURIComponent(k) + "=" + encodeURIComponent(extras[k]);
                }).join('&');

                let options;
                if (data.apiEndpointUrl) {

                switch (data.space) {
                    // OAuth Authorization requests
                    case 'tumblr':
                    case 'twitter':
                        data.url = data.apiEndpointUrl + '?' + urlExtras;
                        options = {
                            hostname: data.apiUrl,
                            path: data.apiEndpointUrl + '?' + urlExtras,
                            headers: {
                                Authorization: makeOAuthHeaders(data)
                            }
                        };
                        console.log(options.path);
                        console.log(options.headers);

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

                    // Access Token requests
                    default:

                        data.url = data.apiEndpointUrl;
                        data.url += !data.url.includes('?') ? `?erratik=datawhore` : `&v=${Date.now()}`;
                        data.url += '&' + urlExtras;

                        options = {
                            uri: `https://${data.apiUrl}${data.url}&access_token=${data.accessToken}&oauth_token=${data.accessToken}`,
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };
                        console.log(options.uri);

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
                                            // console.log(settings.extras);

                                            Setting.updateSettings(settings, () => {
                                                    console.log('saved new token: ' + accessToken);
                                                    // fakeError = 200;
                                                    // requestDataWithToken();
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
        if (req) {
            extras = DROP_FETCH_EXTRAS(data.space, false);
            runCall(data, req, res);
        } else {

            Drop.findDrops(data.space, 'all', function (_data) {
                extras = DROP_FETCH_EXTRAS(data.space, data.isFetchingPast, _data);
                if (!data.contentPath) data.contentPath = "";
                runCall(data, null, null, cb);
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

