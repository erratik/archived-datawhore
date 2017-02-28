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
            this.findOne({space: spaceName, 'schemas.type': schemaType}, {'schemas.$': 1},
                function (err, docs) {
                    if (docs) {
                        cb(docs.schemas[0]);
                    }
                }
            );
        },
        writeSchema: function (spaceName: string, schema: any, cb) {
            const that = this;
            this.findOneAndUpdate(
                {space: spaceName},
                {modified: Date.now(), schemas: [schema]},
                {upsert: true, setDefaultsOnInsert: true},
                function (err, updated) {
                    that.findOne({space: spaceName, 'schemas.type': schema.type}, {'schemas.$': 1},
                        function (_err, docs) {
                            if (docs) {
                                cb(docs.schemas[0]);
                            }
                        }
                    );
                });
        }
    }

};

const Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);

module.exports = Schema;
