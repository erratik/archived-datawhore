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
            let _this = this;
            this.find({space: spaceName}, function (err, retrievedSpace) {
                const space = retrievedSpace[0];
                if (!space) {

                    const query = {space: spaceName},
                        update = {modified: Date.now()},
                        opts = {multi: false, upsert: true};

                    _this.update(query, update, opts, function (error, modelUpdated) {

                        if (modelUpdated) {
                            console.log(update);
                        } else if (error) {
                            console.log(error);
                        }

                    });
                }
                cb(err, space);
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
                }
                settings.type = 'oauth';
                return settings;
            });
        }

        update.oauth = update.oauth.settings;
        // console.log('update ->', update);

        this.model('Setting').update(query, update, opts, function (err, modelUpdated) {

            if (modelUpdated) {
                // console.log('modelUpdated ->', modelUpdated);
                cb(update);
            } else if (err) {
                cb(err);
            }

        });

    }
    /*    getProperties: function(trs
     ype, callback) {
     return this.model('Setting').find({ name: this.name }, function(err, Setting){
     //console.log(Setting);
     callback(Setting[0][type+'Properties']);
     });
     },
     update: function(options, callback){

     var query = { name: this.name},
     update = {last_modified : moment().format('X')},
     opts = {multi: false, upsert: true};

     var that = this.model('Setting');

     this.model('Setting').findOne({name: query.name}, function (err, currentProperties) {

     // console.log('------------ current (raw) ---------------');
     var properties = currentProperties[options.type+'Properties'];
     // console.log(properties);
     // console.log('------------ saving (raw) ---------------');
     // console.log(options.data);

     if (options.updateFromConfig) {
     // console.log('updating from config!');
     _.forEach(options.data, function (prop, key) {
     if (!_.isNil(properties[key])) {
     // if the drop property has been saved already (friendlyName is not
     // the same as the pathName key), don't overwrite
     // console.log('$ ', key, ': ', properties[key]);
     if (key != properties[key].friendlyName) {
     options.data[key] = properties[key];
     // console.log('* * * ', key + ' will be saved from current properties', options.data[key]);
     }
     }
     });
     }
     update[options.type+'Properties'] = options.data;
     // callback();
     that.update(query, update, opts, callback);
     });

     }*/

};

const Setting = require('./createModel')(mongoose, 'Setting', SettingSchema);

module.exports = Setting;
