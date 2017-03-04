var mongoose = require('mongoose');
var Space = require('../models/spaceModel');
var SettingSchema = {
    schema: {
        space: String,
        modified: Number,
        connected: Boolean,
        oauth: [],
        extras: []
    },
    self: {
        findSettings: function (spaceName, cb) {
            var _this = this;
            this.find({ space: spaceName }, function (err, retrievedSpace) {
                var space = retrievedSpace[0];
                if (!space) {
                    var query = { space: spaceName }, update = { modified: Date.now() }, opts = { multi: false, upsert: true };
                    _this.update(query, update, opts);
                }
                cb(err, space);
            });
        },
        updateSettings: function (update, cb) {
            var query = { space: update.name }, opts = { multi: false, upsert: true };
            delete update._id;
            update.space = update.name;
            update.modified = Date.now();
            update.connected = typeof update.connected !== 'undefined' ? false : update.connected;
            // stamp the oauth extras with a type
            if (update.oauth.extras) {
                update.extras = update.oauth.extras.map(function (settings) {
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
            }
            else {
                delete update.oauth;
            }
            this.findOneAndUpdate(query, update, { upsert: true, setDefaultsOnInsert: true }, function (err, updated) {
                // console.log('updated?', updated);
                cb(updated);
            });
        }
    }
};
var Setting = require('./createModel')(mongoose, 'Setting', SettingSchema);
module.exports = Setting;
