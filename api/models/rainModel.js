var mongoose = require('mongoose');
var dimensionSchema = new mongoose.Schema({
    type: String,
    friendlyName: String,
    schemaPath: String
});
var RainSchema = {
    schema: {
        space: String,
        modified: Number,
        dimensions: [dimensionSchema]
    },
    self: {
        findBySpace: function (space, cb) {
            return this.find({ space: space }, function (err, rain) {
                cb(rain);
            });
        },
        updateRain: function (space, dimensions, cb) {
            // update.type = 'drop';
            dimensions.modified = Date.now();
            dimensions.forEach(function (dim, i) { return dimensions[i].type = 'drop'; });
            this.findOneAndUpdate({ space: space }, { modified: Date.now(), dimensions: dimensions }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                console.log('model update ->', updated);
                cb(updated);
            });
        }
    }
};
var Rain = require('./createModel')(mongoose, 'rain', RainSchema);
module.exports = Rain;
