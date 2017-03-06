'use strict';


let SwaggerExpress = require('swagger-express-mw');
let express = require('express');

let app = require('express')();
let session = require('express-session');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');  // mongoose for mongodb
let multer = require('multer');
let fs = require('fs');

module.exports = app; // for testing

let config = {
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

    //  Connect to our mongo database
    // mongoose.connect(process.env.MONGO_DB + '?authMechanism=SCRAM-SHA-1');
    mongoose.connect('mongodb://localhost/datawhore');

    mongoose.connection.on('error', function (error) {
        console.log(error);
    });

    const port = process.env.PORT || 10010;


    /** API path that will upload the files */
    app.post('/api/upload/:space/:folder/:filename', function(req, res) {
        console.log('$%^#$@#$ from app.js NEED TO MOVE! @#!@$#');
        const storage = multer.diskStorage({
            destination: function (request, file, cb) {
                cb(null, `../src/assets/uploads/${request.params.space}/${request.params.folder}`);
            },
            filename: function (request, file, cb) {
                const datetimestamp = Date.now();
                cb(null, request.params.space + '-' + request.params.filename + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
            }
        });

        // multer settings
        const upload = multer({
            storage: storage
        }).single('file');

        upload(req, res, function(error) {
            // console.log(req.file);
            if (error) {
                res.json({error_code: 1, err_desc: error});
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
