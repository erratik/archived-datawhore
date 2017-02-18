var mongoose = require('mongoose');
var moment = require('moment');
var _ = require('lodash');

// Define the model w/ pretty syntax!
var ProfileSchema = {
    schema: {
        name: String,
        last_modified: Number,
        avatar: String,
        username: String,
        postProperties: {},
        profileProperties: {},
        post: {
            type:Object,
            entities: {}
        }
    },
    self: {
        findByName: function(name, cb) {
            return this.find({ name: name }, cb);
        }
    },
    getProperties: function(type, callback) {
         return this.model('Profile').find({ name: this.name }, function(err, profile){
             //console.log(profile);
             callback(profile[0][type+'Properties']);
         });
    },
    update: function(options, callback){

        var query = { name: this.name},
            update = {last_modified : moment().format('X')},
            opts = {multi: false, upsert: true};

        var that = this.model('Profile');

        this.model('Profile').findOne({name: query.name}, function (err, currentProperties) {

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

    }

};

// var Profile = require('./createModel')(mongoose, 'Profile', ProfileSchema);

module.exports = ProfileSchema;