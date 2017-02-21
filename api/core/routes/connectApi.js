var request = require('request');

module.exports = function (app) {

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
            // console.log(body);
            res.send(body);
        });

    });

    // oauth grant handlers
    app.get('/handle_facebook_callback', function (req, res) {
        console.log(req.query);
        res.end(JSON.stringify(req.query, null, 2))
    });

    app.get('/handle_twitter_callback', function (req, res) {
        // console.log(req.query);
        res.end(JSON.stringify(req.query, null, 2))
    });

};