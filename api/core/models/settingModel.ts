let mongoose = require('mongoose');

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
            const _this = this;
            this.find({space: spaceName}, function (err, retrievedSpace) {
                const space = retrievedSpace[0];
                if (!space) {

                    const query = {space: spaceName},
                        update = {modified: Date.now()},
                        opts = {multi: false, upsert: true};

                    _this.update(query, update, opts);
                }
                cb(err, space);
            });
        },
        updateSettings: function (update, cb) {

            const query = {space: update.name},
                opts = {multi: false, upsert: true};

            delete update._id;
            update.space = update.name;
            update.modified = Date.now();
            update.connected = false;

            // stamp the oauth extras with a type
            if (update.oauth.extras) {

                update.connected = update.oauth.extras.filter(extra => {
                    if (extra.label.indexOf('token') >= 0) {
                        return true;
                    }
                }).length;

                update.extras = update.oauth.extras.map(settings => {
                    if (settings.label.indexOf('token') !== -1) {
                        update.connected = true;
                        if (settings.label === 'access_token') {
                            settings.label = 'accessToken';
                        }
                    }
                    settings.type = 'oauth';
                    return settings;
                });
            }

            update.oauth = update.oauth.settings;
            console.log('update ->', update);

            this.model('Setting').findOneAndUpdate(
                {space: update.name},
                {modified: Date.now(), oauth: update.oauth, extras: update.extras },
                {upsert: true, returnNewDocument: true, setDefaultsOnInsert: true},
                function (err, updated) {
                    console.log('modelUpdated ->', updated);
                    cb(updated);
                });

        }
    },

    updateSettings: function (update, cb) {

        const query = {space: update.name},
            opts = {multi: false, upsert: true};

        delete update._id;
        update.space = update.name;
        update.modified = Date.now();
        update.connected = false;

        // stamp the oauth extras with a type
        if (update.oauth.extras) {

            update.connected = update.oauth.extras.filter(extra => {
                if (extra.label.indexOf('token') >= 0) {
                         return true;
                }
            }).length;

            update.extras = update.oauth.extras.map(settings => {
                if (settings.label.indexOf('token') !== -1) {
                    update.connected = true;
                    if (settings.label === 'access_token') {
                        settings.label = 'accessToken';
                    }
                }
                settings.type = 'oauth';
                return settings;
            });
        }

        update.oauth = update.oauth.settings;
        console.log('update ->', update);

        this.model('Setting').findOneAndUpdate(
            {space: update.name},
            {modified: Date.now(), oauth: update.oauth, extras: update.extras },
            {upsert: true, returnNewDocument: true, setDefaultsOnInsert: true},
            function (err, updated) {
                console.log('modelUpdated ->', updated);
                cb(updated);
            });
        // this.model('Setting').update(query, update, opts, function (err, modelUpdated) {
        //
        //     if (modelUpdated) {
        //         console.log('modelUpdated ->', modelUpdated);
        //         cb(update);
        //     } else if (err) {
        //         cb(err);
        //     }
        //
        // });

    }

};

const Setting = require('./createModel')(mongoose, 'Setting', SettingSchema);

module.exports = Setting;
