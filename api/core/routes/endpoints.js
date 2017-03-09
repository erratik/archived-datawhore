var Schema = require('../models/schemaModel');
var Setting = require('../models/settingModel');
var Space = require('../models/spaceModel');
var Profile = require('../models/profileModel');
module.exports = {
    schema: {
        write: function (space, content, type, cb) {
            // then we have other type of schema, using request(), instead of https(),
            // so... not twitter, so far...
            content = (typeof content === 'string') ? JSON.parse(content) : content;
            var schema = {
                type: type,
                content: typeof content.data !== 'undefined' ? content.data : content
            };
            Schema.writeSchema(space, schema, function (updatedSchema) {
                console.log('[schema.write callback]', updatedSchema);
                cb(updatedSchema);
            });
        },
        get: function (space, type, cb) {
            Schema.findSchema(space, type, function (schema) {
                console.log(schema);
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
                // console.log(updatedProfile);
                cb(content);
            });
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
