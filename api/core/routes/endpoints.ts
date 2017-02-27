let Schema = require('../models/schemaModel');
let Profile = require('../models/profileModel');

module.exports = {
    schemas: {
        write: function (space, content, type, cb) {
            const schema = {
                type: type,
                content: content
            };

            Schema.writeSchema(space, schema, (updatedSchema) => {
                cb(updatedSchema.schemas.filter(s => s.type === type)[0]);
            });
        },
        get: function (space, type, cb) {

            Schema.findSchema(space, type, (schema) => {
                cb(schema);
            });

        }
    },
    profile: {
        write: function (space, content, type = null, cb) {
            console.log('content ', content);
           /* const schema = {
                type: type,
                content: content
            };
            */
            Profile.writeProfile(space, content, (updatedProfile) => {
                // console.log(updatedProfile);
                cb(content);
            });
        },
        get: function (space, type, cb) {

            Profile.findProfile(space, type, (schema) => {
                console.log('[endpoints] get profile', schema);
                cb(schema);
            });

        }
    }
};
