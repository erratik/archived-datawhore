let mongoose = require('mongoose');

// var moment = require('moment');
// const _ = require('lodash');

const SettingSchema = {
    schema: {
        space: String,
        modified: Number,
        oauth: [],
        extras: []
    },
    self: {
        findBySpaceName: function (spaceName: string, cb) {
            this.find({space: spaceName}, function(err, retrievedSpace) {
                const space = retrievedSpace[0];
                cb(err, space || `no settings saved for ${spaceName}`);
            });
        }
    },

    updateSettings: function (update, cb) {
        const query = {space: update.name},
            opts = {multi: false, upsert: true};
        update.modified = Date.now();
        if (update.oauth.extras) {
            update.extras = update.oauth.extras.map(settings => {
                settings.type = 'oauth';
                return settings;
            });
        }

        update.oauth = update.oauth.settings;

        this.model('Setting').update(query, update, opts, function (err, modelUpdated) {

            if (modelUpdated) {

                console.log('updated', update, update.name, update.modified);
                console.log('----------------------------------');

                cb(update);
            } else if (err) {
                cb(err);
            }

        });

        // { "_id" : ObjectId( "5715955c3b15d2b156fc4dba" ),
        //     "space" : "moves",
        //     "modified" : 1462416395,
        //     "oauth" : [
        //     { "value" : "Np70goaQaH27n3n5BrbdENOe5V0IQf9wbVZXT1Ocqop1EULJou",
        //         "label" : "Consumer Key",
        //         "keyName" : "apiKey" },
        //     { "value" : "4Oz4tjYZOCeqcaBbVIiLTaVAaAGF7ajIZCbOgs3JYtSuOjKYCK",
        //         "label" : "Consumer Secret",
        //         "keyName" : "apiSecret" },
        //     { "value" : "/api/callback/moves",
        //         "label" : "Authorization URL",
        //         "keyName" : "authorizationUrl" } ],
        //     "extras" : [
        //     }
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

var Setting = require('./createModel')(mongoose, 'Setting', SettingSchema);

module.exports = Setting;