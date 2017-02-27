let request = require('request');
let OAuth2 = require('OAuth').OAuth2;
let https = require('https');

module.exports = function (app) {

    app.post('/api/oauth/middleware', function (req, res) {
        // console.log(req.body.url, req.body.data);

        if (req.body.url) {

            const options = {
                uri: req.body.url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: req.body.data
            };

            request(options, function (error, response, body) {
                if (error) {
                    res.send(error);
                }
                res.send(body);
            });
        } else {


            const oauth2 = new OAuth2(
                req.body.oauth2.apiKey,
                req.body.oauth2.apiSecret,
                req.body.oauth2.apiUrl,
                null,
                'oauth2/token',
                null);

            oauth2.getOAuthAccessToken('', {
                'grant_type': 'client_credentials'
            }, function (e, access_token) {
                // console.log(access_token); // string that we can use to authenticate request

                res.json(access_token);
            });
        }

    });

};
