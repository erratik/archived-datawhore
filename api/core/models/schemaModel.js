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
            this.findOne({ 'schemas.type': schemaType }, { 'schemas.$': 1 }, function (err, docs) {
                if (docs) {
                    cb(docs.schemas[0]);
                }
            });
        },
        writeSchema: function (spaceName, schema, cb) {
            this.findOneAndUpdate({ space: spaceName }, { modified: Date.now(), schemas: [schema] }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                console.log();
                cb(updated);
            });
        }
    }
};
var Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);
module.exports = Schema;
