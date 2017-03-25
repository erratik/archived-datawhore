const mongoose = require('mongoose');
const colors = require('colors');
const ObjectId = require('mongodb').ObjectId;

const dropSchema = new mongoose.Schema({
    type: String,
    content: {}
});

let Drop;
const DropSchema = {
    schema: {
        space: String,
        drops: [dropSchema]
    },
    self: {
        findDrops: function (space, type, cb) {
            const query = { space: space};
            this.findOne({space: space}, function (err, docs) {
                if (docs) {
                    cb(docs);
                }
            });
        },
        findDrop: function (space, id, cb) {

            const dropid = new ObjectId(id);
            const query = { space: space, 'drops._id': dropid };
            const subQuery = { '_id': dropid };

            this.find(query, { 'drops.$': 1 }, function (err, docs) {
                cb(docs)
            });

        },
        // removeDrop: function (space, type, cb) {
        //     var query = { space: space, 'schemas.type': type };
        //     this.update(query, { $pull: { schemas: { type: type } } }, { multi: true }, function (error, _updated) {
        //         if (_updated.ok) {
        //             cb();
        //         }
        //     });
        // },
        writeDrop: function (spaceName, schema, cb) {
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
Drop = require('./createModel')(mongoose, 'Drop', DropSchema);
module.exports = Drop;
//# sourceMappingURL=/Users/erratik/Sites/datawhore/admin/api/models/dropModel.js.map
