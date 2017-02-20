'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = require('express')();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');  // mongoose for mongodb
var multer = require('multer');

module.exports = app; // for testing

var config = {
    appRoot: __dirname // required config
};


// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://datawhore.erratik.ca:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


SwaggerExpress.create(config, function (err, swaggerExpress) {
    if (err) {
        throw err;
    }

    // install middleware
    swaggerExpress.register(app);



    //**!// Connect to our mongo database
    // mongoose.connect(process.env.MONGO_DB + '?authMechanism=SCRAM-SHA-1');
    mongoose.connect('mongodb://localhost/datawhore');

    mongoose.connection.on('error', function (err) {
        console.log(err);
    });

    var port = process.env.PORT || 10010;


    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, '../src/assets/uploads/.tmp');
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).single('file');

    /** API path that will upload the files */
    app.post('/api/upload/:space/:folder', function(req, res) {

        upload(req, res,function(err){
            console.log(req.file);
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }

            res.json(req.file);
        });
    });

    require('./core/routes/index')(app);

    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/hello']) {
        console.log('try this:\ncurl http://datawhore.erratik.ca:' + port + '/api/spaces');
    }
});
