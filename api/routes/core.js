const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs');
const mkdirp = require('mkdirp');

const Space = require('../models/spaceModel');
const Setting = require('../models/settingModel');
const Schema = require('../models/schemaModel');

const NamespaceService = require('../services/namespace.service');
const postEndpoint = NamespaceService.postEndpoint;
const getEndpoint = NamespaceService.getEndpoint;

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
            action: `${req.params.endpoint}.get`,
            query: req.query
        };

        getEndpoint(data, (resp) => {
            res.status(200).send(resp);
        });

    })
    .put('/update/:endpoint/:space', (req, res) => {

        const data = {
            space: req.params.space,
            type: req.body.type ? req.body.type : req.params.endpoint,
            action: req.body.action ? req.body.action : `${req.params.endpoint}.write`
        };

        postEndpoint(data, req.body.data, (resp) => {
            res.json(resp);
        })
    });

// SPACES: ENDPOINTS TO GET DATA FROM SPACES (TWITTER, INSTAGRAM, ETC)
router.post('/endpoint/space', function (req, res) {
    let data = req.body.data;
    NamespaceService.endpointSpaceCall(data, req, res);
});

// UPLOADS
// todo: change this to a put request
router.post('/upload/:space/:folder/:filename', function (req, res) {

    // multer settings
    const storage = multer.diskStorage({
        destination: (_req, file, cb) => {
            const folderName = './public/uploads/' + _req.params.space + '/' + _req.params.folder;
            mkdirp(folderName, function (err) {
                cb(null, folderName);
            });
        },
        filename: (_req, file, cb) => {
            cb(null, _req.params.space + '-' + _req.params.filename + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        }
    });
    const upload = multer({ storage: storage }).single('file');

    upload(req, res, function (err) {

        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        console.log(req.file);
        // todo: return base64 string for the icon
        Space.updateSpace(
            req.params.space,
            { icon: req.file.path, modified: Date.now() },
            (space) => res.json(space));

        // res.json(req.file);
    });
});

module.exports = router;
