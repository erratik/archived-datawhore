let Schema = require('../models/schemaModel');

module.exports = {
    schemas: {
        write: function (space, content, type, cb) {
            const schema = {
                type: type,
                content: content
            };

            Schema.writeSchema(space, schema, (updatedSchema) => {
                cb(updatedSchema.schemas.filter(s => s.type === type)[0]);
            });
        },
        get: function (space, type, cb) {

            Schema.findSchema(space, type, (schema) => {
                console.log('[endpoints] get schema', schema);
                cb(schema);
            });

        }
    }
};
