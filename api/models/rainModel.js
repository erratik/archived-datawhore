var mongoose = require('mongoose');
var _ = require('lodash');
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
            return this.findOne({ space: space }, function (err, rain) {
                cb(rain);
            });
        },
        updateRain: function (space, dimensions, rainType, cb) {

            const dimType = rainType;
            const query = { space: space, 'dimensions.type': dimType };

            var that = this;
            let existingDims = [];
            var addSchema = function (callback) {

                that.findOneAndUpdate({ space: space }, {  dimensions: dimensions.concat(existingDims) }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                    that.find(query, { 'dimensions.$': 1 }, (err, docs) => {
                        if (err) cb(err);
                        updated.dimensions = docs[0].dimensions;
                        cb(updated);
                    });
                });
            };

            this.findOne({ space: space }, function (errata, dimList) {

                existingDims = dimList.dimensions.filter(dim => dim.type !== dimType);

                that.find(query, { 'dimensions.$': 1 }, function (_err, _docs) {
                    if (_docs.length) {
                        that.update(query, { $pull: { dimensions: { type: dimType } } }, { multi: true }, function (error, _updated) {
                            console.log('pulled', _updated);
                            if (_updated.ok) {
                                addSchema(cb);
                            }
                        });
                    }
                    else {
                        addSchema(cb);
                    }
                });
             });

        }
    }
};
var Rain = require('./createModel')(mongoose, 'rain', RainSchema);
module.exports = Rain;
//# sourceMappingURL=/Users/erratik/Sites/datawhore/admin/api/models/rainModel.js.map
