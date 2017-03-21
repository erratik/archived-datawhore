var mongoose = require('mongoose');
var Space = require('./spaceModel');
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
            this.find({ space: spaceName }, function (err, docs) {
                if (!docs.length) {
                    docs = [{ space: spaceName, modified: Date.now() }];
                }
                cb(docs[0]);
            });
        },
        removeSettings: function (name, cb) {
            this.remove({ space: name }, cb);
        },
        updateSettings: function (update, cb) {
            var query = { space: update.name || update.space }, opts = { multi: false, upsert: true };
            delete update._id;
            update.space = update.name;
            update.modified = Date.now();
            update.connected = update.connected ? false : update.connected;


            let extrasKeys = [];

            if (update.oauth.extras) {
                update.extras = update.oauth.extras.map(function (settings) {
                    if (settings.label === 'access_token') {
                        update.connected = true;
                        settings.label = 'accessToken';
                    }
                    settings.type = 'oauth';
                    return settings;
                });

                update.extras.forEach(s => extrasKeys.push(s.keyName));
            }

            if (!extrasKeys.includes('authorizationUrl')) {
                update.extras.push({
                    type: 'oauth',
                    label: 'authorizationUrl',
                    value: `http://datawhore.erratik.ca:10010/auth/${update.space}`
                })
            }

            if (update.oauth.settings) {
                update.oauth = update.oauth.settings;
            } else {
                delete update.oauth;
            }

            this.findOneAndUpdate(query, update, { upsert: true, returnNewDocument: true }, (err, updated) => cb(updated));
        }
    }
};
var Setting = require('./createModel')(mongoose, 'Setting', SettingSchema);
module.exports = Setting;
//# sourceMappingURL=/Users/erratik/Sites/datawhore/admin/api/models/settingModel.js.map
