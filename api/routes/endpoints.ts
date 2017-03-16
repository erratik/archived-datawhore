const Schema = require('../models/schemaModel');
const Setting = require('../models/settingModel');
const Space = require('../models/spaceModel');
const Profile = require('../models/profileModel');
const Rain = require('../models/rainModel');

module.exports = {
    schema: {
        write: function (space, content, type, cb) {

            Schema.findSchema(space, type, (_schema) => {
                content = (typeof content === 'string') ? JSON.parse(content) : content;

                const fetchUrl = content.fetchUrl;
                delete content.fetchUrl;
                content = content.data ? content.data : content;

                const schema = {
                    type: type,
                    content: content,
                    fetchUrl: !fetchUrl ? _schema.fetchUrl : fetchUrl
                };

                Schema.writeSchema(space, schema, (updatedSchema) => {
                    console.log('[schema.write callback]', updatedSchema);
                    cb(updatedSchema);
                });
            });
        },
        get: function (space, type, cb) {

            Schema.findSchema(space, type, (schema) => {
                // console.log(schema);
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
                // todo: make sure to return what's updated, not what's intended for updated
                cb(content);
            });
        },
        /*get: function (space, type, cb) {

            Profile.findProfile(space, (profile) => cb(profile));

        }*/
    },
    rain: {
        write: function (space, content, type = null, cb) {
            Rain.updateRain(space, content, (updatedRain) => {
                console.log(updatedRain);
                cb(content);
            });
        },
        get: function (space, type = null, cb) {
            Rain.findBySpace(space, (rain) => cb(rain));
        }
    },
    settings: {
        write: function (space, content, type = null, cb) {
            Setting.updateSettings(content, (updatedSettings) => cb(content));
        },
        get: function (space, type, cb) {
            Setting.findSettings(space, (settings) => cb(settings));
        }
    }
};
