const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
var Drop = require('./dropModel');
var _ = require('lodash');

const childSchema = new mongoose.Schema({
    type: String,
    fetchUrl: String,
    dropUrl: String,
    contentPath: String,
    modified: Number,
    dropCount: Number,
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
                if (!docs) {
                    var schema = new Schema({
                        space: spaceName,
                        schemas: [{
                            type: schemaType,
                            modified: Date.now()
                        }]
                    });
                    docs = {schemas: [schema]};
                }
                if (!schemaType.includes('rain')) {
                    cb(docs.schemas.filter(function (schema) {
                        return schema.type === schemaType;
                    })[0]);
                } else if (docs) { 
                    
                        let schemas = docs.schemas.filter(schema => !!schema.type && schema.type.includes('rain'));
                        
                            Drop.countByTypes(spaceName, (types) => {
                                
                                schemas = schemas.map(schema => {
                                    schema.dropCount =  types.filter(c => c.type === schema.type)[0].count;
                                
                                    return schema;
                                });
                                cb(schemas);
                            });
                            
                }
             });
        },
        findAllSchemas: function (cb) {
            this.find({}, function (err, docs) {
                if (err) cb(err);
                cb(docs);
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
                if (typeof schema.fetchUrl === 'object') {
                    schema.fetchUrl = schema.fetchUrl.apiEndpointUrl;
                }
                that.findOneAndUpdate({ space: spaceName }, { $push: { schemas: schema } }, { upsert: true, returnNewDocument: true }, function (err, updated) {
                    if (err) cb(err);
                    that.findOne({ space: spaceName, 'schemas.type': schema.type }, { 'schemas.$': 1 }, (err, docs) => {
                        if (err) cb(err);
                        cb(docs.schemas[0]);
                    });
                });
            };

            this.findOne(query, { 'schemas.$': 1 }, function (_err, docs) {
                if (docs) {
                    that.update(query, { $pull: { schemas: schemaQuery } }, { multi: false }, function (error, _updated) {
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
