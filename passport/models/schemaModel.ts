let mongoose = require('mongoose');

const colors = require('colors');
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

            const query = {space: spaceName, 'schemas.type': schema.type};
            const that = this;
            const addSchema = (callback) => {
                that.findOneAndUpdate(
                    {space: spaceName},
                    {modified: Date.now(), $push: {schemas: schema}},
                    {upsert: true, returnNewDocument: true},
                    function (err, updated) {
                        // console.log('... and updated', schema);
                        callback(schema);
                    });
            };

            this.findOne(query, {'schemas.$': 1},
                function (_err, docs) {

                    if (docs) {
                        that.update(
                            query,
                            {$pull: {schemas: {type: schema.type}}},
                            {multi: true}, function (error, _updated) {
                                // console.log('pulled', _updated);
                                if (_updated.ok) {
                                    addSchema(cb);
                                }
                            }
                        );
                    } else {
                        // console.log(`no ${schema.type} schema found, creating`);
                        addSchema(cb);
                    }

                }
            );
        }
    }

};

Schema = require('./createModel')(mongoose, 'Schema', SchemaSchema);

module.exports = Schema;
