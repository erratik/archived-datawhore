const Schema = require('../models/schemaModel');
const Setting = require('../models/settingModel');
const Space = require('../models/spaceModel');
const Drop = require('../models/dropModel');
const Profile = require('../models/profileModel');
const Rain = require('../models/rainModel');
const objectPath = require('object-path');
const moment = require('moment');


module.exports = {
    schema: {
        update: function (params, content, cb) {
            Schema.findSchema(params, (schema) => {

                schema.content = content;

                Schema.writeSchema(params, schema, (updatedSchema) => {
                    console.log('[schema.update callback]', updatedSchema);
                    cb(updatedSchema);
                });

            });
        },
        write: function (params, data, cb, fetchUrl = null) {

            let schema = {
                type: params.type,
                content: (typeof data === 'string') ? JSON.parse(data) : data
            }

            if (params.type.includes('rain')) {
                schema['fetchUrl'] = fetchUrl;
            }

            Schema.writeSchema(params, schema, (updatedSchema) => {
                updatedSchema.space = updatedSchema.name = params.space;
                console.log('[schema.write callback]', updatedSchema);

                cb(updatedSchema);
            });


        },
        get: function (options, cb) {

            Schema.findSchema(options, (schema) => {
                // console.log(schema);
                cb(schema);
            });

        },
        getAll: function (options, cb) {
            // options.spaces = JSON.parse(options.spaces);
            Schema.findAllSchemas(options, (schemas) => {
                // console.log(schema);
                cb(schemas);
            });

        }
    },
    profile: {
        write: function (space, content, cb) {

            Profile.writeProfile(space, content, (updatedProfile) => {
                // console.log(updatedProfile);
                cb(content);
            });
        },
        get: function (options, cb) {

            Profile.findProfile(options.space, (profile) => cb(profile));

        }
    },
    space: {
        write: function (options, content, cb) {
            Space.updateSpace(options, content, (updatedProfile) => {
                // todo: make sure to return what's updated, not what's intended for updated
                cb(content);
            });
        },
        status: function (space) {
            Setting.findSettings(options.space, (settings) => {cb(settings.connected)});
        }
    },
    rain: {
        write: function (params, content, cb) {
            params.type = content[0].type;
            Rain.updateRain(params, content, (updatedRain) => {
                console.log(updatedRain);
                cb(content);
            });
        },
        get: function (options, cb) {
            Rain.findBySpace(options.space, (rain) => cb(rain));
        }   
    },
    settings: {
        write: function (space, content, type = null, cb) {
            Setting.updateSettings(content, (updatedSettings) => cb(content));
        },
        get: function (options, cb) {
            Setting.findSettings(options.space, (settings) => cb(settings));
        }
    },
    drops: {
        fetch: function (options, data, cb) {

            let drops = typeof data === 'string' && !data.includes('<html>')  ? JSON.parse(data) : data;
            let dropCount = 0;
            const error = Object.keys(drops).filter(o => o.includes('error'));
            if (!drops.errors || error.length || !drops.error) {

                drops = options.contentPath ? objectPath.get(drops, options.contentPath): drops;
                if (drops && drops.length) {
                    let schema = drops.map(drop => { return {type: options.type, content: drop}} );

                    Drop.writeDrops(options.space, schema, options.type, function (data, lastDropAdded) {
                        // if (space === 'spotify') {
                        //     debugger;
                        // }
                        cb(data, lastDropAdded);
                    });
               } else if (options.space === 'moves') {
                    if (!!JSON.parse(data).error || JSON.parse(data).status === 'error' || JSON.parse(data).status === 'notfound' ) {
                        cb(JSON.parse(data), dropCount);
                        return;
                    }
                    let schema = [{
                        type: options.type,
                        content: {
                            timestamp: moment(JSON.parse(data)[0].date).format('x')
                        }
                    }];

                    Drop.writeDrops(options.space, schema, options.type, function (data, lastDropAdded) {
                        cb(data, lastDropAdded);
                    });

                } else {
                    cb(data, false);
                }
            } else {
                cb(drops);
            }
        },
        get: function (options, cb) {
            Drop.getSpaceDrops(options, function (drops) {
                // drops = drops.map(drop => {
                //     JSON.parse(drop.content)
                // });
                cb(drops);
            });
        },
        delete: function (space, dropIds, type, cb, options) {
            Drop.removeDrops(space, dropIds, function (data) {
                cb(data);
            });
        }
    }
};
