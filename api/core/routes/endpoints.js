var Schema = require('../models/schemaModel');
var Profile = require('../models/profileModel');
module.exports = {
    schemas: {
        write: function (space, content, type, cb) {
            var schema = {
                type: type,
                content: content
            };
            Schema.writeSchema(space, schema, function (updatedSchema) {
                cb(updatedSchema.schemas.filter(function (s) { return s.type === type; })[0]);
            });
        },
        get: function (space, type, cb) {
            Schema.findSchema(space, type, function (schema) {
                cb(schema);
            });
        }
    },
    profile: {
        write: function (space, content, type, cb) {
            if (type === void 0) { type = null; }
            console.log('content ', content);
            /* const schema = {
                 type: type,
                 content: content
             };
             */
            Profile.writeProfile(space, content, function (updatedProfile) {
                // console.log(updatedProfile);
                cb(content);
            });
        },
        get: function (space, type, cb) {
            Profile.findProfile(space, type, function (schema) {
                console.log('[endpoints] get profile', schema);
                cb(schema);
            });
        }
    }
};
