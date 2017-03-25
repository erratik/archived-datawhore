const mongoose = require('mongoose');
const colors = require('colors');
const ObjectId = require('mongodb').ObjectId;

const childSchema = new mongoose.Schema({
    type: String,
    fetchUrl: String,
    modified: Number,
    content: {}
});

let Schema;
const SchemaSchema = {
    schema: {
        space: String,
        schemas: [childSchema]
    },
    self: {
        findSchema: function (spaceName, schemaType, cb) {
            this.findOne({ space: spaceName }, function (err, docs) {
                if (!docs.schemas.length) {
                    var schema = new Schema({
                        space: spaceName,
                        schemas: [{
                            type: schemaType,
                            modified: Date.now()
                        }]
                    });
                    docs.schemas.push(schema);
                }
                if (!schemaType.includes('rain')) {
                    cb(docs.schemas.filter(function (schema) {
                        return schema.type === schemaType;
                    })[0]);
                } else {
                    cb(docs.schemas.filter(function (schema) {
                        const type = schema.type;
                        return type.includes('rain');
                    }));
                }
            });
        },
        removeSchema: function (space, type, cb) {
            var query = { space: space, 'schemas.type': type };
            this.update(query, { $pull: { schemas: { type: type } } }, { multi: true }, function (error, _updated) {
                if (_updated.ok) {
                    cb();
                }
            });
        },
        writeSchema: function (spaceName, schema, cb) {
            const that = this;
            const sid = new ObjectId(schema.id);
            const squery = sid;
            const query = schema.type === 'profile' ? { space: spaceName, 'schemas.type': schema.type } : { space: spaceName, 'schemas._id': sid };
            const schemaQuery = schema.type === 'profile' ? { 'type': schema.type } : { '_id': sid };


            const addSchema = function (callback) {
                schema.modified = Date.now();
                // console.log(schema);
                that.findOneAndUpdate({ space: spaceName }, { $push: { schemas: schema } }, { upsert: true, returnNewDocument: true }, function (err, updated) {

                    that.find({ space: spaceName, 'schemas.type': schema.type }, { 'schemas.$': 1 }, (err, docs) => {
                        if (err) cb(err);
                        // console.log('... and updated', docs[0].schemas[0]);
                        cb(docs[0].schemas[0]);
                    });
                });
            };

            this.findOne(query, { 'schemas.$': 1 }, function (_err, docs) {
                if (docs) {
                    that.update(query, { $pull: { schemas: schemaQuery } }, { multi: false }, function (error, _updated) {
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
//# sourceMappingURL=/Users/erratik/Sites/datawhore/admin/api/models/schemaModel.js.map
