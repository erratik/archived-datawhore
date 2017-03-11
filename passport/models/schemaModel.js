var mongoose = require('mongoose');
var childSchema = new mongoose.Schema({
    type: String,
    modified: Number,
    content: {}
});
var Schema;
var SchemaSchema = {
    schema: {
        space: String,
        schemas: [childSchema]
    },
    self: {
        findSchema: function (spaceName, schemaType, cb) {
            // console.log(`finding ${spaceName} ${schemaType} schema`);
            this.find({ space: spaceName }, function (err, docs) {
                if (!docs.length) {
                    var schema = new Schema({
                        space: spaceName,
                        schemas: [{
                                type: schemaType,
                                modified: Date.now()
                            }]
                    });
                    docs.push(schema);
                }
                cb(docs[0].schemas.filter(function (schema) { return schema.type === schemaType; })[0]);
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
Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);
module.exports = Schema;
