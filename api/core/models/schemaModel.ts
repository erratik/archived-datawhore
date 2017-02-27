let mongoose = require('mongoose');

let childSchema = new mongoose.Schema({
    type: String,
    modified: Number,
    content: {}
});

const SchemaSchema = {
    schema: {
        space: String,
        schemas: [childSchema]
    },
    self: {
        findSchema: function (spaceName: string, schemaType: string, cb) {
            this.findOne({'schemas.type': schemaType}, {'schemas.$': 1},
                function (err, docs) {
                    if (docs) {
                        cb(docs.schemas[0]);
                    }
                }
            );
        },
        writeSchema: function (spaceName: string, schema: any, cb) {

            this.findOneAndUpdate(
                {space: spaceName},
                {modified: Date.now(), schemas: [schema]},
                {upsert: true, returnNewDocument: true},
                function (err, updated) {
                    console.log();
                    cb(updated);
                });
        }
    }

};

const Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);

module.exports = Schema;
