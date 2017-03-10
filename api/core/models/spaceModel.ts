let mongoose = require('mongoose');
let Setting = require('../models/settingModel');
let Profile = require('../models/profileModel');

let SpaceSchema = {
    schema: {
        name: String,
        modified: Number,
        avatar: String,
        username: String,
        icon: String
    },
    self: {
        findByName: function (name, cb) {
            return this.find({name: name}, cb);
        },
        getAll: function (cb) {
            return this.find({}, cb);
        },
        removeSpace: function (name, cb) {
            // console.log(name)
            Setting.removeSettings(name, function() {});
            Profile.removeProfile(name, function() {});

            this.remove({name: name}, cb);
        },
        updateSpace: function (spaceName, update, cb) {
            update.modified = Date.now();
            this.findOneAndUpdate(
                {name: spaceName},
                update,
                {upsert: true, returnNewDocument: true},
                function (err, updated) {
                    // console.log(updated);
                    cb(updated);
                });
        }
    }
};

let Space = require('./createModel')(mongoose, 'Space', SpaceSchema);

module.exports = Space;
