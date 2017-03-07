let Schema = require('../models/schemaModel');
let Space = require('../models/spaceModel');
let Profile = require('../models/profileModel');

module.exports = {
    schema: {
        write: function (space, content, type, cb) {

            // then we have other type of schema, using request(), instead of https(),
            // so... not twitter, so far...
            content = (typeof content === 'string') ? JSON.parse(content) : content;

            const schema = {
                type: type,
                content: typeof content.data !== 'undefined' ? content.data : content
            };

            Schema.writeSchema(space, schema, (updatedSchema) => {
                console.log('[schema.write callback]', updatedSchema);
                cb(updatedSchema);
            });
        },
        get: function (space, type, cb) {

            Schema.findSchema(space, type, (schema) => {
                console.log(schema);
                cb(schema);
            });

        }
    },
    profile: {
        write: function (space, content, type = null, cb) {
            Profile.writeProfile(space, content, (updatedProfile) => {
                // console.log(updatedProfile);
                cb(content);
            });
        },
        get: function (space, type, cb) {

            Profile.findProfile(space, (profile) => cb(profile));

        }
    },
    space: {
        write: function (space, content, type = null, cb) {
            Space.updateSpace(space, content, (updatedProfile) => {
                // console.log(updatedProfile);
                cb(content);
            });
        },
        get: function (space, type, cb) {

            Profile.findProfile(space, (profile) => cb(profile));

        }
    }
};
