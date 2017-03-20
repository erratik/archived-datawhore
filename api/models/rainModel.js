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
            const that = this;
            dimensions.modified = Date.now();
            dimensions.forEach(function (dim, i) { return dimensions[i].type = 'drop'; });
            this.findOneAndUpdate({ space: space }, { modified: Date.now(), dimensions: dimensions }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                that.find({ space: space }, (err, docs) => {
                    if (err) cb(err);
                    console.log('model update ->', docs[0]);
                    cb(docs[0]);
                });
            });
        }
    }
};
var Rain = require('./createModel')(mongoose, 'rain', RainSchema);
module.exports = Rain;
//# sourceMappingURL=/Users/erratik/Sites/datawhore/admin/api/models/rainModel.js.map
