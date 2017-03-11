let mongoose = require('mongoose');
let Space = require('./spaceModel');

const SettingSchema = {
    schema: {
        space: String,
        modified: Number,
        connected: Boolean,
        oauth: [],
        extras: []
    },
    self: {
        findSettings: function (spaceName: string, cb) {
            this.find({space: spaceName},
                function (err, docs) {
                    if (!docs.length) {
                        docs = [{space: spaceName, modified: Date.now()}];
                    }
                    cb(docs[0]);
                }
            );
        },
        removeSettings: function (name, cb) {
            this.remove({space: name}, cb);
        },
        updateSettings: function (update, cb) {

            const query = {space: update.name || update.space},
                opts = {multi: false, upsert: true};

            delete update._id;
            update.space = update.name;
            update.modified = Date.now();
            update.connected = typeof update.connected !== 'undefined' ? false : update.connected;

            // stamp the oauth extras with a type
            if (update.oauth.extras) {

                update.extras = update.oauth.extras.map(settings => {

                    if (settings.label === 'access_token') {
                        update.connected = true;
                        settings.label = 'accessToken';
                    }

                    settings.type = 'oauth';
                    return settings;
                });
            }

            if (update.oauth.settings) {
                update.oauth = update.oauth.settings;
            } else {
                delete update.oauth;
            }

            this.findOneAndUpdate(
                query,
                update,
                {upsert: true, returnNewDocument: true},
                function (err, updated) {
                    // console.log('updated?', updated);
                    cb(updated);
                });

        }
    }

};

const Setting = require('./createModel')(mongoose, 'Setting', SettingSchema);

module.exports = Setting;
