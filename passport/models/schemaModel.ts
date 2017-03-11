let mongoose = require('mongoose');

let childSchema = new mongoose.Schema({
    type: String,
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
        findSchema: function (spaceName: string, schemaType: string, cb) {
            // console.log(`finding ${spaceName} ${schemaType} schema`);

            this.find({space: spaceName},
                function (err, docs) {
                    if (!docs.length) {

                        const schema = new Schema({
                            space: spaceName,
                            schemas: [{
                                type: schemaType,
                                modified: Date.now()
                            }]
                        });

                        docs.push(schema);

                    }
                    cb(docs[0].schemas.filter(schema => schema.type === schemaType)[0]);
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

Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);

module.exports = Schema;
