var mongoose = require('mongoose');
// var moment = require('moment');
// const _ = require('lodash');
var SettingSchema = {
    schema: {
        space: String,
        modified: Number,
        oauth: [],
        extras: []
    },
    self: {
        findBySpaceName: function (spaceName, cb) {
            this.find({ space: spaceName }, function (err, retrievedSpace) {
                var space = retrievedSpace[0];
                cb(err, space || "no settings saved for " + spaceName);
            });
        }
    },
    updateSettings: function (update, cb) {
        var query = { space: update.name }, opts = { multi: false, upsert: true };
        update.modified = Date.now();
        if (update.oauth.extras) {
            update.extras = update.oauth.extras.map(function (settings) {
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
            }
            else if (err) {
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
};
var Setting = require('./createModel')(mongoose, 'Setting', SettingSchema);
module.exports = Setting;
