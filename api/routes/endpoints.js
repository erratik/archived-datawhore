const Schema = require('../models/schemaModel');
const Setting = require('../models/settingModel');
const Space = require('../models/spaceModel');
const Drop = require('../models/dropModel');
const Profile = require('../models/profileModel');
const Rain = require('../models/rainModel');

module.exports = {
    schema: {
        update: function (space, data, type, cb, dropFetchUrl) {
            Schema.findSchema(space, type, (_schema) => {

                let schema = data;

                if (type === 'profile') {
                    schema = {
                        type: type,
                        content: data
                    }
                }

                Schema.writeSchema(space, schema, (updatedSchema) => {
                    console.log('[schema.update callback]', updatedSchema);
                    cb(updatedSchema);
                });

            });
        },
        write: function (space, data, type, cb, fetchUrl = null) {

            let schema = {
                type: type,
                content: (typeof data === 'string') ? JSON.parse(data) : data
            }

            if (type.includes('rain')) {
                schema['fetchUrl'] = fetchUrl;
            }

            Schema.writeSchema(space, schema, (updatedSchema) => {
                console.log('[schema.write callback]', updatedSchema);
                cb(updatedSchema);
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
        }
    },
    rain: {
        write: function (data, content, type = null, cb) {
            type = content[0].type;
            Rain.updateRain(data, content, type, (updatedRain) => {
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
    },
    drops: {
        fetch: function (space, data, type = null, cb, extras) {

            let drops = (typeof data === 'string') ? JSON.parse(data) : data;
            const error = Object.keys(drops).filter(o => o.includes('error'));
            if (!error.length) {

                if (extras.contentPath) {
                    drops = drops[extras.contentPath];
                }

                let schema = drops.map(drop => { return {type: type, content: drop}} );

                Drop.writeDrops(space, schema, type, function (data) {
                    cb(data);
                });
            } else {
                cb(drops);
            }
        },
        get: function (space, type, cb) {
            Drop.findDrops(space, type, function (data) {
                cb(data);
            });
        }
    }
};
