var mongoose = require('mongoose');
var Setting = require('./settingModel');
var Profile = require('./profileModel');
var SpaceSchema = {
    schema: {
        name: String,
        modified: Number,
        avatar: String,
        description: String,
        username: String,
        icon: String,
        docUrl: String,
        apiUrl: String
    },
    self: {
        getAll: function (cb) {
            return this.find({}, cb);
        },
        findByName: function (name, cb) {
            return this.find({ name: name }, cb);
        },
        removeSpace: function (name, cb) {
            Setting.removeSettings(name, function () { });
            Profile.removeProfile(name, function () { });
            this.remove({ name: name }, cb);
        },
        updateSpace: function (space, update, cb) {
            update.modified = Date.now();
            this.findOneAndUpdate({ name: space }, update, { upsert: true, returnNewDocument: true }, function (err, updated) {
                cb(updated);
            });
        }
    }
};
var Space = require('./createModel')(mongoose, 'Space', SpaceSchema);
module.exports = Space;
//# sourceMappingURL=/Users/erratik/Sites/datawhore/admin/api/models/spaceModel.js.map
