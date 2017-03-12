let mongoose = require('mongoose');

let dimensionSchema = new mongoose.Schema({
    type: String,
    friendlyName: String,
    schemaPath: String
});

let RainSchema = {
    schema: {
        space: String,
        modified: Number,
        dimensions: [dimensionSchema]
    },
    self: {
        findBySpace: function (space: string, cb) {
            return this.find({space: space},
                function (err, rain) {
                    cb(rain);
                });
        },
        updateRain: function (space: string, dimensions: any, cb) {

            // update.type = 'drop';
            dimensions.modified = Date.now();

            dimensions.forEach((dim, i) => dimensions[i].type = 'drop');

            this.findOneAndUpdate(
                {space: space},
                {modified: Date.now(), dimensions: dimensions},
                {upsert: true, returnNewDocument: true},
                function (err, updated) {
                    console.log('model update ->', updated);
                    cb(updated);
                });
        }
    }
};

let Rain = require('./createModel')(mongoose, 'rain', RainSchema);

module.exports = Rain;
