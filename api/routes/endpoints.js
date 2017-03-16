var Schema = require('../models/schemaModel');
var Setting = require('../models/settingModel');
var Space = require('../models/spaceModel');
var Profile = require('../models/profileModel');
var Rain = require('../models/rainModel');
module.exports = {
    schema: {
        write: function (space, content, type, cb) {
            Schema.findSchema(space, type, function (_schema) {
                content = (typeof content === 'string') ? JSON.parse(content) : content;
                var fetchUrl = content.fetchUrl;
                delete content.fetchUrl;
                content = content.data ? content.data : content;
                var schema = {
                    type: type,
                    content: content,
                    fetchUrl: !fetchUrl ? _schema.fetchUrl : fetchUrl
                };
                Schema.writeSchema(space, schema, function (updatedSchema) {
                    console.log('[schema.write callback]', updatedSchema);
                    cb(updatedSchema);
                });
            });
        },
        get: function (space, type, cb) {
            Schema.findSchema(space, type, function (schema) {
                // console.log(schema);
                cb(schema);
            });
        }
    },
    profile: {
        write: function (space, content, type, cb) {
            if (type === void 0) { type = null; }
            Profile.writeProfile(space, content, function (updatedProfile) {
                // console.log(updatedProfile);
                cb(content);
            });
        },
        get: function (space, type, cb) {
            Profile.findProfile(space, function (profile) { return cb(profile); });
        }
    },
    space: {
        write: function (space, content, type, cb) {
            if (type === void 0) { type = null; }
            Space.updateSpace(space, content, function (updatedProfile) {
                // todo: make sure to return what's updated, not what's intended for updated
                cb(content);
            });
        }
    },
    rain: {
        write: function (space, content, type, cb) {
            if (type === void 0) { type = null; }
            Rain.updateRain(space, content, function (updatedRain) {
                console.log(updatedRain);
                cb(content);
            });
        },
        get: function (space, type, cb) {
            if (type === void 0) { type = null; }
            Rain.findBySpace(space, function (rain) { return cb(rain); });
        }
    },
    settings: {
        write: function (space, content, type, cb) {
            if (type === void 0) { type = null; }
            Setting.updateSettings(content, function (updatedSettings) { return cb(content); });
        },
        get: function (space, type, cb) {
            Setting.findSettings(space, function (settings) { return cb(settings); });
        }
    }
};
