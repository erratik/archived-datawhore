var mongoose = require('mongoose');
var SpaceSchema = {
    schema: {
        name: String,
        modified: Number,
        avatar: String,
        username: String,
        icon: String
    },
    self: {
        findByName: function (name, cb) {
            return this.find({ name: name }, cb);
        },
        getAll: function (cb) {
            return this.find({}, cb);
        },
        updateSpace: function (spaceName, update, cb) {
            update.modified = Date.now();
            this.findOneAndUpdate({ name: spaceName }, update, { upsert: true, returnNewDocument: true }, function (err, updated) {
                // console.log(updated);
                cb(updated);
            });
        }
    }
};
var Space = require('./createModel')(mongoose, 'Space', SpaceSchema);
module.exports = Space;
