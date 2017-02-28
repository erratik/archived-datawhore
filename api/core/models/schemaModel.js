var mongoose = require('mongoose');
var childSchema = new mongoose.Schema({
    type: String,
    modified: Number,
    content: {}
});
var SchemaSchema = {
    schema: {
        space: String,
        schemas: [childSchema]
    },
    self: {
        findSchema: function (spaceName, schemaType, cb) {
            this.findOne({ space: spaceName, 'schemas.type': schemaType }, { 'schemas.$': 1 }, function (err, docs) {
                if (docs) {
                    cb(docs.schemas[0]);
                }
            });
        },
        writeSchema: function (spaceName, schema, cb) {
            var that = this;
            this.findOneAndUpdate({ space: spaceName }, { modified: Date.now(), schemas: [schema] }, { upsert: true, setDefaultsOnInsert: true }, function (err, updated) {
                that.findOne({ space: spaceName, 'schemas.type': schema.type }, { 'schemas.$': 1 }, function (_err, docs) {
                    if (docs) {
                        cb(docs.schemas[0]);
                    }
                });
            });
        }
    }
};
var Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);
module.exports = Schema;
