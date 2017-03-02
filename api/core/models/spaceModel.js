var mongoose = require('mongoose');
var SpaceSchema = {
    doc: {
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
        }
    },
    updateSpace: function (update, cb) {
        /*
         // todo: make updateSpace a self function, like schemaModel
        // todo: use findOneAndUpdate so we can do everything at once!

        this.findOneAndUpdate(
            {space: spaceName},
            {modified: Date.now(), schemas: [schema]},
            {upsert: true, setDefaultsOnInsert: true},
            function (err, updated) {
                console.log();
                cb(updated);
            });
        */
        var query = { name: this.name }, opts = { multi: false, upsert: true };
        update.modified = Date.now();
        this.model('Config').update(query, update, opts, function (err, modelUpdated) {
            if (modelUpdated) {
                cb(update);
            }
            else if (err) {
                cb(err);
            }
        });
    }
};
var Space = require('./createModel')(mongoose, 'Spaces', SpaceSchema);
module.exports = Space;
