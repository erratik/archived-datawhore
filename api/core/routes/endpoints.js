var Schema = require('../models/schemaModel');
var Profile = require('../models/profileModel');
module.exports = {
    schemas: {
        write: function (space, content, type, cb) {
            // then we have other type of schema, using request(), instead of https(),
            // so... not twitter, so far...
            content = (typeof content === 'string') ? JSON.parse(content) : content;
            var schema = {
                type: type,
                content: typeof content.data !== 'undefined' ? content.data : content
            };
            Schema.writeSchema(space, schema, function (updatedSchema) {
                console.log('[profile.write callback]', updatedSchema);
                cb(updatedSchema);
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
                if (!schema) {
                    console.log("[endpoints] no profile found for " + space);
                }
                else {
                    console.log('[endpoints] get profile', schema);
                }
                cb(schema);
            });
        }
    }
};
