var mongoose = require('mongoose');
var colors = require('colors');
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
                if (schemaType !== 'drop') {
                    cb(docs[0].schemas.filter(function (schema) { return schema.type === schemaType; })[0]);
                }
                else {
                    cb(docs[0].schemas.filter(function (schema) { return schema.type.includes('drop'); }));
                }
            });
        },
        writeSchema: function (spaceName, schema, cb) {
            var query = { space: spaceName, 'schemas.type': schema.type };
            var that = this;
            var addSchema = function (callback) {
                schema.modified = Date.now();
                that.findOneAndUpdate({ space: spaceName }, { modified: Date.now(), $push: { schemas: schema } }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                    // console.log('... and updated', schema);
                    callback(schema);
                });
            };
            this.findOne(query, { 'schemas.$': 1 }, function (_err, docs) {
                if (docs) {
                    that.update(query, { $pull: { schemas: { type: schema.type } } }, { multi: true }, function (error, _updated) {
                        // console.log('pulled', _updated);
                        if (_updated.ok) {
                            addSchema(cb);
                        }
                    });
                }
                else {
                    // console.log(`no ${schema.type} schema found, creating`);
                    addSchema(cb);
                }
            });
        }
    }
};
Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);
module.exports = Schema;
